import "./nodeOnly.component.scss"

export class NodeOnlyController {}

export const nodeOnlyComponent = {
	selector: "nodeOnlyComponent",
	template: require("./nodeOnly.component.html"),
	controller: NodeOnlyController
}
