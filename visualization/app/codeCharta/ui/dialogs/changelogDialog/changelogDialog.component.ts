import markdownFile from "../../../../../CHANGELOG.md"
import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { marked } from "marked"

@Component({
    selector: "cc-change-log-dialog",
    templateUrl: "./changelogDialog.component.html"
})
export class ChangelogDialogComponent {
    changes: Record<string, string>

    constructor(@Inject(MAT_DIALOG_DATA) public data: { previousVersion: string; currentVersion: string }) {
        this.changes = this.getChangelogChanges()
    }

    private getChangelogChanges() {
        const parsedMarkdownFile = marked.parse(markdownFile, { headerIds: false })
        let changelogLines = parsedMarkdownFile.split("\n")

        const currentVersionFirstLine = this.findVersionLine(changelogLines, this.data.currentVersion)
        const lastOpenedVersionFirstLine = this.findVersionLine(changelogLines, this.data.previousVersion)

        //Add 1 to keep the version line so that it detects the end of the last set of changes
        changelogLines = changelogLines.slice(currentVersionFirstLine, lastOpenedVersionFirstLine + 1)
        const titles = ["Added 🚀", "Fixed 🐞", "Changed", "Removed 🗑", "Chore 👨‍💻 👩‍💻"]
        const changes = {}
        for (const title of titles) {
            const titlePattern = new RegExp(`<h3>${title}</h3>`)
            const titleLinesIndexes = this.getAllIndexes(changelogLines, titlePattern)

            const changelogTypes: string[] = []
            for (const lineIndex of titleLinesIndexes) {
                // Add 2 to remove the headline and the <ul> tag
                const start = lineIndex + 2
                const end = this.findEndChangesLine(changelogLines, lineIndex)

                for (const changeLine of changelogLines.slice(start, end)) {
                    changelogTypes.push(`${changeLine}<br>`)
                }
            }

            if (changelogTypes.length > 0) {
                changes[title] = changelogTypes.join("\n")
            }
        }
        return changes
    }

    private getAllIndexes(titles: string[], pattern: RegExp) {
        return titles.reduce((matchingTitleIndexes: number[], title, index) => {
            if (pattern.test(title)) {
                matchingTitleIndexes.push(index)
            }
            return matchingTitleIndexes
        }, [])
    }

    private findVersionLine(lines: string[], version: string): number {
        const versionPattern = new RegExp(`\\[${version}]`)
        return lines.findIndex(element => versionPattern.test(element))
    }

    private findEndChangesLine(lines: string[], startLine: number): number {
        return startLine + lines.slice(startLine + 1).findIndex(element => /<h3>/.test(element) || /<h2>/.test(element))
    }
}
