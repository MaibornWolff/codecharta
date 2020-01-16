import "./nodeOnly.component.scss"
import "path"

export class NodeOnlyController {
	constructor() {
		console.log("Component initialized")
	}
}

export const nodeOnlyComponent = {
	selector: "nodeOnlyComponent",
	template: require("./nodeOnly.component.html"),
	controller: NodeOnlyController
}
