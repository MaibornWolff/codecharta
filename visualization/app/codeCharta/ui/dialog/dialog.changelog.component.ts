import markdownFile from "../../../../../CHANGELOG.md"
import packageJson from "../../../../package.json"

export class DialogChangelogController {
	private _viewModel: {
		currentVersion: string
		lastOpenedVersion: string
		changes: Record<string, string>
	} = {
		currentVersion: "",
		lastOpenedVersion: "",
		changes: null
	}

	constructor(private $mdDialog) {
		"ngInject"
		this._viewModel.currentVersion = packageJson.version
		this._viewModel.lastOpenedVersion = localStorage.getItem("codeChartaVersion")

		localStorage.setItem("codeChartaVersion", packageJson.version)
		let changelogLines = markdownFile.split("\n")
		const currentVersionFirstLine = this.findVersionLine(changelogLines, this._viewModel.currentVersion)
		const lastOpenedVersionFirstLine = this.findVersionLine(changelogLines, this._viewModel.lastOpenedVersion)

		//Add 1 to keep the version line so that it detects the end of the last set of changes
		changelogLines = changelogLines.slice(currentVersionFirstLine, lastOpenedVersionFirstLine + 1)
		const titles = ["Added 🚀", "Fixed 🐞", "Changed", "Removed 🗑", "Chore 👨‍💻 👩‍💻"]
		const changes = {}
		for (const title of titles) {
			const titlePattern = new RegExp(`<h3>${title}</h3>`)
			const titleLinesIndexes = this.getAllIndexes(changelogLines, titlePattern)
			const changelogTypes = []
			for (const lineIndex of titleLinesIndexes) {
				// Add 2 to remove the headline and the <ul> tag
				const start = lineIndex + 2
				const end = this.findEndChangesLine(changelogLines, lineIndex)
				for (const changeLine of changelogLines.slice(start, end)) {
					changelogTypes.push(changeLine)
				}
			}
			if (changelogTypes.length > 0) changes[title] = changelogTypes.join("\n")
		}
		this._viewModel.changes = changes
	}

	hide() {
		this.$mdDialog.hide()
	}

	getAllIndexes(titles: string[], pattern: RegExp) {
		return titles.reduce((matchingTitleIndexes, title, index) => {
			if (pattern.test(title)) matchingTitleIndexes.push(index)
			return matchingTitleIndexes
		}, [])
	}

	findVersionLine(lines: string[], version: string): number {
		const versionPattern = new RegExp(version.replace(".", "\\."))
		return lines.findIndex(element => versionPattern.test(element))
	}

	findEndChangesLine(lines: string[], startLine: number): number {
		return startLine + lines.slice(startLine + 1).findIndex(element => /<h3>/.test(element) || /<h2>/.test(element))
	}
}

export const dialogChangelogComponent = {
	selector: "dialogChangelogComponent",
	template: require("./dialog.changelog.component.html"),
	controller: DialogChangelogController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
