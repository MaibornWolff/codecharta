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

    private updateReadme(repository: Repository, newVersion: string): void {
        const readmePath = "README.md"

        let updatedReadme = fs.readFileSync(readmePath, "utf8")
        updatedReadme = this.replaceVersionBadge(repository, updatedReadme, newVersion)
        updatedReadme = this.replaceReleaseBadge(repository, updatedReadme, newVersion)

        fs.writeFileSync(readmePath, updatedReadme)
    }

    private replaceVersionBadge(repository: string, readme: string, newVersion: string): string {
        const repositoryCapitalized = repository === "visualization" ? "Visualization" : "Analysis"

        const versionBadgeRegex = new RegExp(`alt="${repositoryCapitalized} Version Badge" src="https://img\\.shields\\.io/badge/.*?-`)
        const matchVersionBadge = readme.match(versionBadgeRegex)

        if (!matchVersionBadge) {
            throw new Error(`Could not find version badge for ${repositoryCapitalized} in README.md`)
        }

        return readme.replace(
            versionBadgeRegex,
            `alt="${repositoryCapitalized} Version Badge" src="https://img.shields.io/badge/${newVersion}-`
        )
    }

    private replaceReleaseBadge(repository: string, readme: string, newVersion: string): string {
        const repositoryAbbreviation = repository === "visualization" ? "vis" : "ana"
        const repositoryCapitalized = repository === "visualization" ? "Visualization" : "Analysis"

        const releaseBadgeRegex = new RegExp(
            `alt="Release ${repositoryCapitalized} Badge" src="https://img\\.shields\\.io/github/check-runs/MaibornWolff/CodeCharta/${repositoryAbbreviation}-.*?\\?`
        )
        const matchReleaseBadge = readme.match(releaseBadgeRegex)

        if (!matchReleaseBadge) {
            throw new Error(`Could not find release badge for ${repositoryCapitalized} in README.md`)
        }

        const updatedReadme = readme.replace(
            releaseBadgeRegex,
            `alt="Release ${repositoryCapitalized} Badge" src="https://img.shields.io/github/check-runs/MaibornWolff/CodeCharta/${repositoryAbbreviation}-${newVersion}?`
        )

        const releaseBadgeRefRegex = new RegExp(`href="https://github\\.com/MaibornWolff/codecharta/tree/${repositoryAbbreviation}-.*?"`)
        const matchReleaseBadgeRef = updatedReadme.match(releaseBadgeRefRegex)

        if (!matchReleaseBadgeRef) {
            throw new Error(`Could not find release badge reference for ${repositoryCapitalized} in README.md`)
        }

        return updatedReadme.replace(
            releaseBadgeRefRegex,
            `href="https://github.com/MaibornWolff/codecharta/tree/${repositoryAbbreviation}-${newVersion}"`
        )
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
            let unreleasedChangelogSection: string

            // 1. Update version using npm
            try {
                if (normalizedRepo === "visualization") {
                    newVersion = execSync(`cd ${normalizedRepo} && npm version ${type} --no-git-tag-version`)
                        .toString()
                        .trim()
                        .replace("v", "")
                } else {
                    // For analysis, use node-wrapper package.json
                    newVersion = execSync(`cd analysis/node-wrapper && npm version ${type} --no-git-tag-version`)
                        .toString()
                        .trim()
                        .replace("v", "")
                }
            } catch (error) {
                throw new Error(`Failed to update version: ${error}`)
            }

            // 2. Update README.md
            try {
                this.updateReadme(normalizedRepo, newVersion)
            } catch (error) {
                throw new Error(`Failed to update README.md: ${error}`)
            }

            // 3. If analysis, also update gradle.properties
            if (normalizedRepo === "analysis") {
                try {
                    const gradleProps = fs.readFileSync("analysis/gradle.properties", "utf8")
                    const updatedProps = gradleProps.replace(/currentVersion=.+/, `currentVersion=${newVersion}`)
                    fs.writeFileSync("analysis/gradle.properties", updatedProps)
                } catch (error) {
                    throw new Error(`Failed to update analysis versions: ${error}`)
                }
            }

            // 4. Update changelog
            try {
                const changelogPath = `${normalizedRepo}/CHANGELOG.md`
                const changelog = fs.readFileSync(changelogPath, "utf8")

                // Store changelog entries before modifying the file
                unreleasedChangelogSection = this.extractChangelogSection(changelog, "unreleased")

                const updatedChangelog = changelog.replace(
                    "## [unreleased] (Added 🚀 | Changed | Removed  | Fixed 🐞 | Chore 👨‍💻 👩‍💻)",
                    `## [unreleased] (Added 🚀 | Changed | Removed  | Fixed 🐞 | Chore 👨‍💻 👩‍💻)\n\n## [${newVersion}] - ${date}`
                )
                fs.writeFileSync(changelogPath, updatedChangelog)
            } catch (error) {
                throw new Error(`Failed to update changelog: ${error}`)
            }

            // 5. Create release post
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

${unreleasedChangelogSection}`

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

    private extractChangelogSection(changelog: string, version: string): string {
        const lines = changelog.split("\n")
        const startIndex = lines.findIndex(line => line.includes(`## [${version}]`))
        const endIndex = lines.findIndex((line, index) => index > startIndex && line.startsWith("## ["))

        if (startIndex === -1 || endIndex === -1) {
            throw new Error(`Could not find changelog section ${version}`)
        }

        const content = lines
            .slice(startIndex + 1, endIndex)
            .join("\n")
            .trim()

        if (!content) {
            throw new Error(`Changelog section ${version} is empty`)
        }

        if (!content.includes("###")) {
            throw new Error(`No change category (###) found in ${version} section`)
        }

        if (!content.includes("- ")) {
            throw new Error(`No change entry found in ${version} section`)
        }

        return content
    }

    public extractChangelog(repository: string, version?: string): string {
        try {
            this.validateRepository(repository)
            const normalizedRepo = this.getNormalizedRepository(repository)
            const changelogPath = `${normalizedRepo}/CHANGELOG.md`
            const changelog = fs.readFileSync(changelogPath, "utf8")

            return version ? this.extractChangelogSection(changelog, version) : this.extractChangelogSection(changelog, "unreleased")
        } catch (error) {
            console.error(`Error extracting changelog: ${error}`)
            throw error
        }
    }
}

// CLI interface
// @ts-ignore
if (import.meta.main) {
    const [command, ...args] = process.argv.slice(2)
    const manager = new VersionManager()

    switch (command) {
        case "extract-changelog":
            if (args.length === 0 || args.length > 2) {
                console.error("Usage: bun script/version-manager.ts extract-changelog <repository> [version]")
                process.exit(1)
            }
            process.stdout.write(manager.extractChangelog(args[0], args[1]))
            break

        case "update-version":
            if (args.length !== 2) {
                console.error("Usage: bun script/version-manager.ts update-version <repository> <version-type>")
                process.exit(1)
            }
            process.stdout.write(manager.updateVersion(args[0], args[1]))
            break

        default:
            console.error("Unknown command. Available commands: extract-changelog, update-version")
            process.exit(1)
    }
}
