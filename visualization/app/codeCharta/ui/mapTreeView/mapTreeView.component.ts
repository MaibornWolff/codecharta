import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"

export class MapTreeViewController implements CodeMapPreRenderServiceSubscriber {
	private _viewModel: {
		rootNode: CodeMapNode
	} = {
		rootNode: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		if (map == this._viewModel.rootNode) {
			return
		}

		this._viewModel.rootNode = null // To force the update of the root folder's name in the UI
		this.$timeout(() => {
			this._viewModel.rootNode = map
		})
	}
}

export const mapTreeViewComponent = {
	selector: "mapTreeViewComponent",
	template: require("./mapTreeView.component.html"),
	controller: MapTreeViewController
}
