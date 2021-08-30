import markdownFile from "../../../../../CHANGELOG.md"
import packageJson from "../../../../package.json"
interface changeType {
	discoverPattern: RegExp
	changes: Set<string>
}
export class DialogChangelogController {
	private _viewModel: {
		currentVersion: string
		lastOpenedVersion: string
		changeTypes: Map<string, changeType>
	} = {
		currentVersion: "",
		lastOpenedVersion: "",
		changeTypes: null
	}

	constructor(private $mdDialog) {
		"ngInject"

		let changelogLines = markdownFile.split("\n")
		// Get current and last saved version
		this._viewModel.currentVersion = packageJson.version
		this._viewModel.lastOpenedVersion = localStorage.getItem("codeChartaVersion")
		localStorage.setItem("codeChartaVersion", packageJson.version)
		// Get the current version's first line
		const newVersionLine = this.findVersionLine(changelogLines, this._viewModel.currentVersion)
		// Get last line of the last opened/saved version
		const savedVersionLine = this.findVersionLine(changelogLines, this._viewModel.lastOpenedVersion)
		const endVersionLine = this.findEndVersionLine(changelogLines, savedVersionLine)
		// Limit the changelog to only the new versions since last visit
		changelogLines = changelogLines.slice(newVersionLine, endVersionLine)

		// Set the change types to be extracted (Added, Fixed...)
		const changeTypes = new Map()
		const addedChangeType: changeType = { discoverPattern: /Added 🚀/, changes: new Set() }
		changeTypes.set("Added 🚀", addedChangeType)
		const fixedChangeType: changeType = { discoverPattern: /Fixed 🐞/, changes: new Set() }
		changeTypes.set("Fixed 🐞", fixedChangeType)
		const changedChangeType: changeType = { discoverPattern: /Changed/, changes: new Set() }
		changeTypes.set("Changed", changedChangeType)
		const removedChangeType: changeType = { discoverPattern: /Removed 🗑/, changes: new Set() }
		changeTypes.set("Removed 🗑", removedChangeType)
		const choreChangeType: changeType = { discoverPattern: /Chore 👨‍💻 👩‍💻/, changes: new Set() }
		changeTypes.set("Chore 👨‍💻 👩‍💻", choreChangeType)

		for (const changeTypeName of changeTypes.keys()) {
			const changesLines = this.getAllIndexes(changelogLines, changeTypes.get(changeTypeName).discoverPattern)
			for (const change of changesLines) {
				// Add 2 to remove the headline and the <ul> tag
				const start = change + 2
				const end = this.findEndChangesLine(changelogLines, change)
				for (const changeLine in changelogLines.slice(start, end)) {
					changeTypes.get(changeTypeName).changes.add(changelogLines.slice(start, end)[changeLine])
				}
			}
		}
		this._viewModel.changeTypes = changeTypes
	}
	setToArray(set) {
		if (set === undefined) return
		return [...set]
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
