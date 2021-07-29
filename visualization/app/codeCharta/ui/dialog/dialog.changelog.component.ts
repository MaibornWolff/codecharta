import "./dialog.changelog.component.scss"
// @ts-ignore
import md from "../../../../../CHANGELOG.md";
export class DialogChangelogController {
	private _viewModel: {
		title: string
	} = {
		title: "",
	}
    constructor(private $mdDialog) {
        "ngInject"
		console.log(md);
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
