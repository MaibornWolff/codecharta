import markdownFile from "../../../../../CHANGELOG.md"
import { Injectable } from "@angular/core"
import { marked } from "marked"
import { mangle } from "marked-mangle"

export interface ChangelogCategory {
    title: string
    changes: string
}

const CHANGELOG_CATEGORIES = ["Added 🚀", "Fixed 🐞", "Changed", "Removed 🗑", "Chore 👨‍💻 👩‍💻"]

@Injectable({ providedIn: "root" })
export class ChangelogParserService {
    parseChangesBetweenVersions(previousVersion: string, currentVersion: string): ChangelogCategory[] {
        marked.use(mangle())
        const parsedMarkdownFile = marked.parse(markdownFile) as string
        const changelogLines = parsedMarkdownFile.split("\n")

        const currentVersionLine = this.findVersionLine(changelogLines, currentVersion)
        const previousVersionLine = this.findVersionLine(changelogLines, previousVersion)

        if (currentVersionLine === -1 || previousVersionLine === -1) {
            return []
        }

        const relevantLines = changelogLines.slice(currentVersionLine, previousVersionLine + 1)
        return this.extractCategories(relevantLines)
    }

    private extractCategories(lines: string[]): ChangelogCategory[] {
        const categories: ChangelogCategory[] = []

        for (const title of CHANGELOG_CATEGORIES) {
            const titlePattern = new RegExp(`<h3>${title}</h3>`)
            const titleIndexes = this.findAllIndexes(lines, titlePattern)

            const changes: string[] = []
            for (const lineIndex of titleIndexes) {
                const start = lineIndex + 2
                const end = this.findEndOfChanges(lines, lineIndex)

                for (const changeLine of lines.slice(start, end)) {
                    changes.push(changeLine)
                }
            }

            if (changes.length > 0) {
                categories.push({ title, changes: changes.join("\n") })
            }
        }

        return categories
    }

    private findAllIndexes(lines: string[], pattern: RegExp): number[] {
        return lines.reduce((indexes: number[], line, index) => {
            if (pattern.test(line)) {
                indexes.push(index)
            }
            return indexes
        }, [])
    }

    private findVersionLine(lines: string[], version: string): number {
        const versionPattern = new RegExp(`\\[${version}]`)
        return lines.findIndex(line => versionPattern.test(line))
    }

    private findEndOfChanges(lines: string[], startLine: number): number {
        return startLine + lines.slice(startLine + 1).findIndex(line => /<h3>/.test(line) || /<h2>/.test(line))
    }
}
