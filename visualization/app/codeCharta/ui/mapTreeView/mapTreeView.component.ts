import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapNode } from "../../model/codeCharta.model"
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
			// needed to prevent flashing since event is triggered 4 times
			return
		}

		this._viewModel.rootNode = map
		this.synchronizeAngularTwoWayBinding()
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const mapTreeViewComponent = {
	selector: "mapTreeViewComponent",
	template: require("./mapTreeView.component.html"),
	controller: MapTreeViewController
}
