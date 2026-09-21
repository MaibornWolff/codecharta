#!/usr/bin/env node

// Gate for every lockfile change, including the ones Renovate automerges without a human reading them.
// npm audit only knows about advisories that have already been published; this catches the two things a
// fresh compromise looks like in a diff — a package served from somewhere other than the public registry,
// and a package name we have never depended on before arriving unsigned.
//
// Usage: node auditLockfileDiff.mjs <base-ref>

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const PUBLIC_REGISTRY_HOST = "registry.npmjs.org"
const REGISTRY_KEYS_URL = `https://${PUBLIC_REGISTRY_HOST}/-/npm/v1/keys`
const LOCKFILES = [
    "package-lock.json",
    "visualization/package-lock.json",
    "gh-pages/package-lock.json",
    "analysis/node-wrapper/package-lock.json"
]

const baseRef = process.argv[2]
if (!baseRef) {
    fail("usage: node auditLockfileDiff.mjs <base-ref>")
}

const problems = []
const addedPackages = new Map()

for (const lockfile of LOCKFILES) {
    const head = readHeadLockfile(lockfile)
    if (!head) {
        continue
    }
    if (!head.packages) {
        problems.push(`${lockfile} has no "packages" section (lockfileVersion ${head.lockfileVersion}); regenerate it with npm >= 7`)
        continue
    }
    const base = readBaseLockfile(baseRef, lockfile)
    collectForeignRegistries(lockfile, head, problems)
    for (const [name, version] of newlyAddedPackages(base, head)) {
        addedPackages.set(name, version)
    }
}

if (addedPackages.size > 0) {
    const signingKeys = await fetchSigningKeys()
    for (const [name, version] of addedPackages) {
        const unsignedReason = await reasonPublishIsUntrusted(name, version, signingKeys)
        if (unsignedReason) {
            problems.push(`${name}@${version} is newly added and ${unsignedReason}`)
        }
    }
}

report()

function report() {
    if (addedPackages.size === 0) {
        print("No packages added to any lockfile.")
    } else {
        print("Packages added to a lockfile (name these in the PR description):\n")
        for (const [name, version] of [...addedPackages].sort()) {
            print(`  ${name}@${version}`)
        }
        print("")
    }

    if (problems.length === 0) {
        print(
            "✅ Every resolved URL points at the public registry, and every added package was signed with a key that was valid when it was published."
        )
        return
    }
    console.error(`❌ ${problems.length} problem(s):\n`)
    for (const problem of problems) {
        console.error(`  ${problem}`)
    }
    process.exit(1)
}

function print(line) {
    process.stdout.write(`${line}\n`)
}

/** Every tarball has to come from the public registry — a rewritten host is how a diff smuggles in a substitute. */
function collectForeignRegistries(lockfile, lock, into) {
    for (const [path, entry] of Object.entries(lock.packages ?? {})) {
        if (!entry.resolved || entry.link) {
            continue
        }
        const { host } = safeParseUrl(entry.resolved)
        if (host !== PUBLIC_REGISTRY_HOST) {
            into.push(`${lockfile}: ${path} resolves to ${entry.resolved}`)
        }
    }
}

/** Names, not versions: a bump of something we already trust is ordinary, a name we have never seen is not. */
function newlyAddedPackages(base, head) {
    const known = new Set(Object.entries(base?.packages ?? {}).map(entry => publishedNameOf(entry)))
    const added = []
    for (const entry of Object.entries(head.packages ?? {})) {
        const name = publishedNameOf(entry)
        const [, { version }] = entry
        if (name && version && !known.has(name)) {
            added.push([name, version])
        }
    }
    return added
}

/**
 * The path holds the *installed* name, which for an alias (`"a": "npm:b@1"`) is not what was published —
 * npm records the published name in `name` whenever the two differ, and only that one exists in the registry.
 */
function publishedNameOf([path, entry]) {
    if (entry.name) {
        return entry.name
    }
    const marker = "node_modules/"
    return path.includes(marker) ? path.slice(path.lastIndexOf(marker) + marker.length) : ""
}

/**
 * The question is not whether the signing key is valid today but whether it was valid when the package was
 * published — npm retired a key in January 2025, and roughly a tenth of the tree predates it. A malicious
 * publish is by definition recent, so it cannot hide behind the retired key.
 */
async function reasonPublishIsUntrusted(name, version, signingKeys) {
    const packageUrl = `https://${PUBLIC_REGISTRY_HOST}/${name.replaceAll("/", "%2f")}`
    const manifest = await fetchJson(`${packageUrl}/${version}`)
    if (!manifest) {
        return "could not be read from the registry"
    }
    if (manifest.dist?.attestations) {
        return ""
    }
    const keyId = manifest.dist?.signatures?.[0]?.keyid
    if (!keyId) {
        return "carries no registry signature"
    }
    if (!signingKeys.has(keyId)) {
        return `is signed with ${keyId}, a key the registry does not publish at all`
    }
    const expires = signingKeys.get(keyId)
    if (!expires) {
        return ""
    }
    const publishedAt = await fetchPublishDate(packageUrl, version)
    if (!publishedAt) {
        return `is signed with ${keyId}, which expired ${expires}, and its publish date could not be read`
    }
    if (publishedAt >= new Date(expires)) {
        return `was published ${publishedAt.toISOString()} but signed with ${keyId}, which had expired ${expires}`
    }
    return ""
}

/** Read the keys rather than pinning one: npm has retired a key before and will again. */
async function fetchSigningKeys() {
    const keys = await fetchJson(REGISTRY_KEYS_URL)
    if (!keys?.keys) {
        fail(`could not read the registry's signing keys from ${REGISTRY_KEYS_URL}`)
    }
    return new Map(keys.keys.map(({ keyid, expires }) => [keyid, expires ?? undefined]))
}

async function fetchPublishDate(packageUrl, version) {
    const packument = await fetchJson(packageUrl)
    const published = packument?.time?.[version]
    return published ? new Date(published) : undefined
}

function readHeadLockfile(lockfile) {
    try {
        return JSON.parse(readFileSync(lockfile, "utf8"))
    } catch {
        return undefined
    }
}

/** A lockfile absent from the base is a new one — then every package in it counts as added. */
function readBaseLockfile(ref, lockfile) {
    try {
        return JSON.parse(execFileSync("git", ["show", `${ref}:${lockfile}`], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }))
    } catch {
        return undefined
    }
}

async function fetchJson(url) {
    const response = await fetch(url)
    return response.ok ? response.json() : undefined
}

function safeParseUrl(url) {
    try {
        return new URL(url)
    } catch {
        return {}
    }
}

function fail(message) {
    console.error(`❌ ${message}`)
    process.exit(1)
}
