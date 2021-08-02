import "./dialog.changelog.component.scss"
// @ts-ignore
import md from "../../../../../CHANGELOG.md";
// import parseChangelog from 'changelog-parser'

export class DialogChangelogController {
	private _viewModel: {
		title: string
		md: any
	} = {
		title: "",
		md: null,
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
		console.log(md.split("\n").search(/^<h3>/));
		this._viewModel.md = md.split("\n").slice(1).join("\n");
		this._viewModel.title = "x";
	}
	hide() {
		this.$mdDialog.hide()
	}
}

export const dialogChangelogComponent = {
    selector: "dialogChangelogComponent",
    template: require("./dialog.changelog.component.html"),
    controller: DialogChangelogController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
