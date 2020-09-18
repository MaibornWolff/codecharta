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

// Constants
const REVERSE_ORDER = true
const KEEP_ORDER = false

type CompareFunction = (a: CodeMapNode, b: CodeMapNode) => number

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
		let compareFunction: CompareFunction
		if (sortingOption === SortingOption.NUMBER_OF_FILES) {
			compareFunction = (a, b) => b.attributes[NodeMetricDataService.UNARY_METRIC] - a.attributes[NodeMetricDataService.UNARY_METRIC]
		} else {
			compareFunction = (a, b) => (b.name > a.name ? -1 : 1)
		}
		this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, KEEP_ORDER, compareFunction)
	}

	onSortingOrderAscendingChanged() {
		this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, REVERSE_ORDER)
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

	private applySortOrderChange(node: CodeMapNode, reverse: boolean, compareFn?: CompareFunction) {
		if (!node) {
			return
		}
		for (let i = 0; i < node.children.length; i++) {
			if (node.children[i].type === NodeType.FOLDER) {
				node.children[i] = this.applySortOrderChange(node.children[i], reverse, compareFn)
			}
		}
		if (reverse) {
			node.children.reverse()
		} else {
			node.children = this.groupFilesAndFolders(node, compareFn)
		}
		return node
	}

	private groupFilesAndFolders(node: CodeMapNode, compareFn: CompareFunction) {
		const folders: CodeMapNode[] = []
		const files: CodeMapNode[] = []

		for (const child of node.children) {
			if (child.type === NodeType.FOLDER) {
				folders.push(child)
			} else {
				files.push(child)
			}
		}

		// Reverse the sort order if required.
		if (this.storeService.getState().appSettings.sortingOrderAscending) {
			const actualComparator = compareFn
			compareFn = (a, b) => -1 * actualComparator(a, b)
		}

		folders.sort(compareFn)
		files.sort(compareFn)

		folders.push(...files)

		return folders
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
