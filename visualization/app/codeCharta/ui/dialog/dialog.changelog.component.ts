import markdownFile from "../../../../../CHANGELOG.md"
import packageJson from "../../../../package.json"
interface changeType {
	discoverPattern: RegExp
	changes: string[]
}
export class DialogChangelogController {
	private _viewModel: {
		version: string
		changelogMarkdown: any
		changeTypes: Map<any, any>
	} = {
		version: "",
		changelogMarkdown: null,
		changeTypes: null
	}

	constructor(private $mdDialog) {
		"ngInject"

		let changelogLines = markdownFile.split("\n")
		// Get current and last saved version
		this._viewModel.version = packageJson.version
		const savedVersion = localStorage.getItem("codeChartaVersion")
		localStorage.setItem("codeChartaVersion", packageJson.version)
		// Get the current version first line
		const newVersionLine = this.findVersionLine(changelogLines, this._viewModel.version)
		// Get last line of the last opened/saved version
		const savedVersionLine = this.findVersionLine(changelogLines, savedVersion)
		const endVersionLine = this.findEndVersionLine(changelogLines, savedVersionLine)
		this._viewModel.changelogMarkdown = changelogLines.slice(newVersionLine, endVersionLine).join("\n")
		changelogLines = changelogLines.slice(newVersionLine, endVersionLine)

		const changeTypes = new Map()

		const addedChangeType: changeType = { discoverPattern: /Added 🚀/, changes: [] }
		changeTypes.set("Added 🚀", addedChangeType)
		const fixedChangeType: changeType = { discoverPattern: /Fixed 🐞/, changes: [] }
		changeTypes.set("Fixed 🐞", fixedChangeType)
		const changedChangeType: changeType = { discoverPattern: /Changed/, changes: [] }
		changeTypes.set("Changed", changedChangeType)
		const removedChangeType: changeType = { discoverPattern: /Removed 🗑/, changes: [] }
		changeTypes.set("Removed 🗑", removedChangeType)
		const choreChangeType: changeType = { discoverPattern: /Chore 👨‍💻 👩‍💻/, changes: [] }
		changeTypes.set("Chore 👨‍💻 👩‍💻", choreChangeType)

		for (const changeTypeName of changeTypes.keys()) {
			const changesLines = this.getAllIndexes(changelogLines, changeTypes.get(changeTypeName).discoverPattern)
			for (const change of changesLines) {
				// Add 2 to remove the headline and the <ul> tag
				const start = change + 2
				const end = this.findEndChangesLine(changelogLines, change)
				changeTypes.get(changeTypeName).changes.push(...changelogLines.slice(start, end))
			}
		}
		this._viewModel.changeTypes = changeTypes
	}

	hide() {
		this.$mdDialog.hide()
	}
	private getAllIndexes(array, pattern) {
		const indexes = []
		let index
		for (index = 0; index < array.length; index++) if (array[index].search(pattern) > -1) indexes.push(index)
		return indexes
	}
	private findVersionLine(lines: string[], version: string): number {
		const versionPattern = new RegExp(version.replace(".", "\\."))
		return lines.findIndex(element => element.search(versionPattern) > -1)
	}
	private findEndChangesLine(lines: string[], startLine: number): number {
		return startLine + lines.slice(startLine + 1).findIndex(element => element.search(/<h3>/) > -1)
	}
	private findEndVersionLine(lines: string[], versionLine: number): number {
		return versionLine + lines.slice(versionLine + 1).findIndex(element => element.search(/<h2>/) > -1)
	}
}

export const dialogChangelogComponent = {
	selector: "dialogChangelogComponent",
	template: require("./dialog.changelog.component.html"),
	controller: DialogChangelogController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
