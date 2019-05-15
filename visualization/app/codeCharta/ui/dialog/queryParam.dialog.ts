export class QueryParamDialogController {
	constructor(private $mdDialog) {}

	public hide() {
		this.$mdDialog.hide()
	}
}

export const queryParamDialog = {
	clickOutsideToClose: true,
	title: "Query Parameters",
	template: require("./queryParam.dialog.html"),
	controller: QueryParamDialogController,
	controllerAs: "$ctrl"
}
