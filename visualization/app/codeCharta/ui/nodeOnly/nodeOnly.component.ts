import "./nodeOnly.component.scss"

export class NodeOnlyController {
	constructor() {
		console.log("hello")
		//require("path")
	}
}

export const nodeOnlyComponent = {
	selector: "nodeOnlyComponent",
	template: require("./nodeOnly.component.html"),
	controller: NodeOnlyController
}
