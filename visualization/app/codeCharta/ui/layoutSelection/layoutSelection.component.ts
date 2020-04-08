import "./layoutSelection.component.scss"
import { LayoutAlgorithmSubscriber, LayoutAlgorithmService } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { LayoutAlgorithm } from "../../codeCharta.model"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { IRootScopeService } from "angular"
import { setLayoutAlgorithm } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"

export class LayoutSelectionController implements LayoutAlgorithmSubscriber {
	private _viewModel: {
		layoutAlgorithms: string[]
		layoutAlgorithm: LayoutAlgorithm
	} = {
		layoutAlgorithms: null,
		layoutAlgorithm: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		LayoutAlgorithmService.subscribe(this.$rootScope, this)
		this.onLayoutAlgorithmChanged(this.storeService.getState().appSettings.layoutAlgorithm)
		this._viewModel.layoutAlgorithms = _.values(LayoutAlgorithm)
	}

	public onLayoutAlgorithmChanged(layoutAlgorithm: LayoutAlgorithm) {
		this._viewModel.layoutAlgorithm = layoutAlgorithm
	}

	public applyLayoutAlgorithm() {
		this.storeService.dispatch(setLayoutAlgorithm(this._viewModel.layoutAlgorithm))
	}
}

export const layoutSelectionComponent = {
	selector: "layoutSelectionComponent",
	template: require("./layoutSelection.component.html"),
	controller: LayoutSelectionController
}
