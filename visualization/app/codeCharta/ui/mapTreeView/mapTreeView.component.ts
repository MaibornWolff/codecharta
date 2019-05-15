import { IRootScopeService } from "angular"
import { CCFile, CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"

export class MapTreeViewController implements CodeMapPreRenderServiceSubscriber {
	private _viewModel: {
		rootNode: CodeMapNode
	} = {
		rootNode: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
		this._viewModel.rootNode = renderFile.map
	}
}

export const mapTreeViewComponent = {
	selector: "mapTreeViewComponent",
	template: require("./mapTreeView.component.html"),
	controller: MapTreeViewController
}
