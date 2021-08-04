import "./dialog.changelog.component.scss"
// @ts-ignore
import md from "../../../../../CHANGELOG.md"
import packageJson from "../../../../package.json"

export class DialogChangelogController {
	private _viewModel: {
		version: string
		md: any
	} = {
		version: "",
		md: null
	}

	constructor(private $mdDialog) {
		"ngInject"
		const changelogLines = md.split("\n")
		// Get current version
		this._viewModel.version = packageJson.version
		// Get the Changelog just for the newest version
		const newVersionLine = this.findVersionLine(changelogLines)
		const endVersionLine = this.findEndVersionLine(changelogLines, newVersionLine)
		this._viewModel.md = changelogLines.slice(newVersionLine, endVersionLine).join("\n")
	}

	hide() {
		this.$mdDialog.hide()
	}

	findVersionLine(lines) {
		const versionPattern = new RegExp(this._viewModel.version.replace(".", "\\."))
		return lines.findIndex(element => element.search(versionPattern) > -1)
	}

	findEndVersionLine(lines, newVersionLine) {
		return newVersionLine + lines.slice(newVersionLine + 1).findIndex(element => element.search(/<h2>/) > -1)
	}
}

export const dialogChangelogComponent = {
	selector: "dialogChangelogComponent",
	template: require("./dialog.changelog.component.html"),
	controller: DialogChangelogController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
