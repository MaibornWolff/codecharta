import "./attributeSideBar.component.scss"

export class AttributeSideBarController {
	/* @ngInject */
	constructor() {}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
