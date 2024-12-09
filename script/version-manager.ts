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
        if (repository !== "visualization" && repository !== "analysis") {
            throw new Error(`Invalid repository: ${repository}. Must be either "visualization" or "analysis"`)
        }
    }

    private validateVersionType(type: string): asserts type is VersionType {
        if (type !== "major" && type !== "minor" && type !== "patch") {
            throw new Error(`Invalid version type: ${type}. Must be one of: major, minor, patch`)
        }
    }

    private validateFiles(repository: string) {
        if (repository === "visualization") {
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

            const date = new Date().toISOString().split("T")[0]
            const prefix = repository === "visualization" ? "vis" : "ana"

            // 1. Update version using npm
            let newVersion: string
            try {
                newVersion = execSync(`cd ${repository} && npm version ${type} --no-git-tag-version`).toString().trim().replace("v", "")
            } catch (error) {
                throw new Error(`Failed to update version in ${repository}/package.json: ${error}`)
            }

            // 2. If analysis, also update gradle.properties
            if (repository === "analysis") {
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
                const changelogPath = `${repository}/CHANGELOG.md`
                const changelog = fs.readFileSync(changelogPath, "utf8")

                if (!changelog.includes("## [unreleased]")) {
                    throw new Error("Changelog must contain an unreleased section")
                }

                const changelogEntries = this.extractLatestChangelog(changelog)

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
                const postContent = `---
categories:
  - Release
  - Release-${repository}
tags:
  - gh-pages
  - release
  - ${repository.toLowerCase()}

title: ${repository} version ${newVersion}
---

{{page.title}} is live and ready for [download](https://github.com/MaibornWolff/codecharta/releases/tag/${prefix}-${newVersion}). 
This version brings the following:

${this.extractLatestChangelog(fs.readFileSync(`${repository}/CHANGELOG.md`, "utf8"))}`

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
        const entries: string[] = []
        let started = false

        for (const line of lines) {
            if (line.startsWith("## [unreleased]")) {
                started = true
                continue
            }
            if (started && line.startsWith("## [")) {
                break
            }
            if (started && line.trim()) {
                entries.push(line)
            }
        }

        return entries.join("\n")
    }
}

// CLI interface
if (import.meta.main) {
    if (process.argv.length !== 4) {
        console.error("Usage: bun run script/version-manager.ts <repository> <version-type>")
        process.exit(1)
    }

    const [repository, type] = process.argv.slice(2)
    const manager = new VersionManager()
    process.stdout.write(manager.updateVersion(repository, type))
}

export default VersionManager
