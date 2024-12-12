#!/usr/bin/env bun
import * as fs from "fs"
import { execSync } from "child_process"

declare global {
    interface ImportMeta {
        main: boolean
    }
}

type Repository = "visualization" | "analysis"
type VersionType = "major" | "minor" | "patch"

class VersionManager {
    private validateRepository(repository: string): asserts repository is Repository {
        const normalized = repository.toLowerCase()
        if (normalized !== "visualization" && normalized !== "analysis") {
            throw new Error(`Invalid repository: ${repository}. Must be either "Visualization" or "Analysis" (case insensitive)`)
        }
    }

    private getNormalizedRepository(repository: string): Repository {
        return repository.toLowerCase() as Repository
    }

    private validateVersionType(type: string): asserts type is VersionType {
        if (type !== "major" && type !== "minor" && type !== "patch") {
            throw new Error(`Invalid version type: ${type}. Must be one of: major, minor, patch`)
        }
    }

    private validateFiles(repository: string) {
        const normalizedRepo = this.getNormalizedRepository(repository)
        if (normalizedRepo === "visualization") {
            const visualizationFiles = ["visualization/package.json", "visualization/CHANGELOG.md"]
            for (const file of visualizationFiles) {
                if (!fs.existsSync(file)) {
                    throw new Error(`Required file not found: ${file}`)
                }
            }
        } else {
            // Analysis repository
            const analysisFiles = ["analysis/CHANGELOG.md", "analysis/gradle.properties", "analysis/node-wrapper/package.json"]
            for (const file of analysisFiles) {
                if (!fs.existsSync(file)) {
                    throw new Error(`Required file not found: ${file}`)
                }
            }
        }
    }

    private ensureDirectoryExists(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    }

    public updateVersion(repository: string, type: string): string {
        try {
            // Validate inputs
            this.validateRepository(repository)
            this.validateVersionType(type)
            this.validateFiles(repository)

            const normalizedRepo = this.getNormalizedRepository(repository)
            const date = new Date().toISOString().split("T")[0]
            const prefix = normalizedRepo === "visualization" ? "vis" : "ana"

            let newVersion: string
            let changelogEntries: string

            // 1. Update version using npm
            try {
                newVersion = execSync(`cd ${normalizedRepo} && npm version ${type} --no-git-tag-version`).toString().trim().replace("v", "")
            } catch (error) {
                throw new Error(`Failed to update version in ${normalizedRepo}/package.json: ${error}`)
            }

            // 2. If analysis, also update gradle.properties
            if (normalizedRepo === "analysis") {
                try {
                    const gradleProps = fs.readFileSync("analysis/gradle.properties", "utf8")
                    const updatedProps = gradleProps.replace(/currentVersion=.+/, `currentVersion=${newVersion}`)
                    fs.writeFileSync("analysis/gradle.properties", updatedProps)

                    // Update node-wrapper version
                    execSync(`cd analysis/node-wrapper && npm version ${newVersion} --no-git-tag-version`)
                } catch (error) {
                    throw new Error(`Failed to update analysis versions: ${error}`)
                }
            }

            // 3. Update changelog
            try {
                const changelogPath = `${normalizedRepo}/CHANGELOG.md`
                const changelog = fs.readFileSync(changelogPath, "utf8")

                if (!changelog.includes("## [unreleased]")) {
                    throw new Error("Changelog must contain an unreleased section")
                }

                // Store changelog entries before modifying the file
                changelogEntries = this.extractLatestChangelog(changelog)

                if (!changelogEntries.trim()) {
                    throw new Error("No entries found in unreleased section")
                }

                const updatedChangelog = changelog
                    .replace("## [unreleased]", `## [${newVersion}] - ${date}`)
                    .replace(/(# Changelog\n\n)/, `$1## [unreleased] (Added 🚀 | Changed | Removed  | Fixed 🐞 | Chore 👨‍💻 👩‍💻)\n\n`)
                fs.writeFileSync(changelogPath, updatedChangelog)
            } catch (error) {
                throw new Error(`Failed to update changelog: ${error}`)
            }

            // 4. Create release post
            try {
                const displayName = repository.charAt(0).toUpperCase() + repository.slice(1).toLowerCase()
                const postContent = `---
categories:
  - Release
  - Release-${displayName}
tags:
  - gh-pages
  - release
  - ${normalizedRepo}

title: ${displayName} version ${newVersion}
---

{{page.title}} is live and ready for [download](https://github.com/MaibornWolff/codecharta/releases/tag/${prefix}-${newVersion}). 
This version brings the following:

${changelogEntries}`

                const postsDir = "gh-pages/_posts/release"
                this.ensureDirectoryExists(postsDir)
                fs.writeFileSync(`${postsDir}/${date}-${prefix}_${newVersion}.md`, postContent)
            } catch (error) {
                throw new Error(`Failed to create release post: ${error}`)
            }

            return newVersion
        } catch (error) {
            console.error(`Error during version update: ${error}`)
            throw error
        }
    }

    private extractLatestChangelog(changelog: string): string {
        const lines = changelog.split("\n")
        const startIndex = lines.findIndex(line => line.toLowerCase().startsWith("## [unreleased]"))
        const endIndex = lines.findIndex((line, index) => index > startIndex && line.startsWith("## ["))

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("Could not find unreleased section in changelog")
        }

        const content = lines
            .slice(startIndex + 1, endIndex)
            .join("\n")
            .trim()

        // Validate content
        if (!content) {
            throw new Error("Unreleased section is empty")
        }

        // Check for at least one change entry
        if (!content.includes("###")) {
            throw new Error("No change categories (###) found in unreleased section")
        }

        // Check for at least one bullet point
        if (!content.includes("-")) {
            throw new Error("No changes (bullet points) found in unreleased section")
        }

        return content
    }
}

// CLI interface
if (import.meta.main) {
    if (process.argv.length !== 4) {
        console.error("Usage: bun script/version-manager.ts <repository> <version-type>")
        process.exit(1)
    }

    const [repository, type] = process.argv.slice(2)
    const manager = new VersionManager()
    process.stdout.write(manager.updateVersion(repository, type))
}
