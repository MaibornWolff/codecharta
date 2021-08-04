import "./dialog.changelog.component.scss"
// @ts-ignore
import md from "../../../../../CHANGELOG.md"

// import parseChangelog from 'changelog-parser'

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

		// parseChangelog({
		// 	text: ""
		// }).then(function (result) {
		// 	// changelog object
		// 	console.log(result)
		// }).catch(function (err) {
		// 	// Whoops, something went wrong!
		// 	console.error(err)
		// })
		// console.log(angular.element(document.querySelector('#change')));
		const changelogLines = md.split("\n")
		const newVersionLine = this.findVersionLine(changelogLines)
		const endVersionLine = this.findEndVersionLine(changelogLines, newVersionLine)
		this._viewModel.md = changelogLines.slice(newVersionLine, endVersionLine).join("\n")
	}

	hide() {
		this.$mdDialog.hide()
	}

	findVersionLine(lines) {
		return lines.findIndex(element => element.search(/1\.73\.0/) > -1)
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
