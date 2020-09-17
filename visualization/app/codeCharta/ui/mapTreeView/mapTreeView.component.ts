import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapNode, NodeType, SortingOption } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import {
	SortingOrderAscendingService,
	SortingOrderAscendingSubscriber
} from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"
import { SortingOptionService, SortingOptionSubscriber } from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"
import { clone } from "../../util/clone"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

export class MapTreeViewController implements CodeMapPreRenderServiceSubscriber, SortingOptionSubscriber, SortingOrderAscendingSubscriber {
	private _viewModel: {
		rootNode: CodeMapNode
	} = {
		rootNode: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
		SortingOptionService.subscribe(this.$rootScope, this)
		SortingOrderAscendingService.subscribe(this.$rootScope, this)
	}

	onSortingOptionChanged(sortingOption: SortingOption) {
		if (sortingOption === SortingOption.NUMBER_OF_FILES) {
			this._viewModel.rootNode = this.applySortOrderChange(
				this._viewModel.rootNode,
				(a, b) => b.attributes[NodeMetricDataService.UNARY_METRIC] - a.attributes[NodeMetricDataService.UNARY_METRIC],
				false
			)
		} else {
			this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, (a, b) => (b.name > a.name ? -1 : 1), false)
		}
	}

	onSortingOrderAscendingChanged() {
		this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, null, true)
	}

	onRenderMapChanged(map: CodeMapNode) {
		if (map === this._viewModel.rootNode) {
			// needed to prevent flashing since event is triggered 4 times
			return
		}

		this._viewModel.rootNode = clone(map)
		this.synchronizeAngularTwoWayBinding()
		this.onSortingOptionChanged(this.storeService.getState().dynamicSettings.sortingOption)
	}

	private applySortOrderChange(node: CodeMapNode, compareFn: (a: CodeMapNode, b: CodeMapNode) => number, reverse: boolean) {
		if (!node) {
			return
		}
		for (let i = 0; i < node.children.length; i++) {
			if (node.children[i].type === NodeType.FOLDER) {
				node.children[i] = this.applySortOrderChange(node.children[i], compareFn, reverse)
			}
		}
		if (!reverse) {
			node.children = this.groupFilesAndFolders(node, compareFn)
		} else {
			node.children.reverse()
		}
		return node
	}

	private groupFilesAndFolders(node: CodeMapNode, compareFn: (a: CodeMapNode, b: CodeMapNode) => number) {
		const folders = node.children.filter(node => node.type === NodeType.FOLDER)
		const files = node.children.filter(node => node.type === NodeType.FILE)

		folders.sort(compareFn)
		files.sort(compareFn)

		if (this.storeService.getState().appSettings.sortingOrderAscending) {
			return folders.concat(files).reverse()
		}

		return folders.concat(files)
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
