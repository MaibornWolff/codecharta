import { IRootScopeService } from "angular"

import { CodeMapBuilding } from "../../codeMap/rendering/codeMapBuilding"
import { BuildingSelectedEventSubscriber, ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { Node } from "../../../codeCharta.model"

class NodePathController implements BuildingSelectedEventSubscriber {
	private _viewModel: {
		node: Node
		packageFileCount: number
		fileCountDescription: string
	} = {
		node: null,
		packageFileCount: 0,
		fileCountDescription: ""
	}

	constructor(private $rootScope: IRootScopeService) {
		"ngInject"
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
	}

	onBuildingSelected(selectedBuilding?: CodeMapBuilding) {
		this._viewModel.node = selectedBuilding.node
		this._viewModel.packageFileCount = selectedBuilding.node?.attributes?.unary ?? 0
		this._viewModel.fileCountDescription = NodePathController.getFileCountDescription(this._viewModel.packageFileCount)
	}

	static getFileCountDescription(fileCount: number) {
		if (fileCount === 0) return "empty"
		if (fileCount === 1) return "1 file"
		return `${fileCount} files`
	}
}

export const nodePathComponent = {
	selector: "ccNodePathComponent",
	template: require("./nodePath.component.html"),
	controller: NodePathController
}
