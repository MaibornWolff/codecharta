import "./treeMapStartDepth.component.scss"
import {
	TreeMapStartDepthService,
	TreeMapStartDepthSubscriber
} from "../../state/store/appSettings/treeMapStartDepth/treeMapStartDepth.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import _ from "lodash"
import { setTreeMapStartDepth } from "../../state/store/appSettings/treeMapStartDepth/treeMapStartDepth.actions"

export class TreeMapStartDepthController implements TreeMapStartDepthSubscriber {
	private _viewModel: {
		treeMapStartDepth: number
	} = {
		treeMapStartDepth: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		TreeMapStartDepthService.subscribe(this.$rootScope, this)
		const treeMapStartDepth = 4
		// const treeMapStartDepth = this.storeService.getState().appSettings.treeMapStartDepth
		this.onTreeMapStartDepthChanged(treeMapStartDepth)
		this._viewModel.treeMapStartDepth = treeMapStartDepth
	}

	public onTreeMapStartDepthChanged(treeMapStartDepth: number) {
		this._viewModel.treeMapStartDepth = treeMapStartDepth
	}

	public applyTreeMapStartDepth() {
		this.storeService.dispatch(setTreeMapStartDepth(this._viewModel.treeMapStartDepth))
	}
}

export const treeMapStartDepthComponent = {
	selector: "treeMapStartDepthComponent",
	template: require("./treeMapStartDepth.component.html"),
	controller: TreeMapStartDepthController
}
