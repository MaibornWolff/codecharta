import "./layoutSelection.component.scss"

export class LayoutSelectionController {
	/* @ngInject */
	constructor() {}
}

export const layoutSelectionComponent = {
	selector: "layoutSelectionComponent",
	template: require("./layoutSelection.component.html"),
	controller: LayoutSelectionController
}
