import { IRootScopeService, ITimeoutService } from "angular"
import { klona } from "klona"
import ngRedux from "ng-redux"

import { CodeMapNode, NodeType, SortingOption } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { SortingOptionService, SortingOptionSubscriber } from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { selectSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { onStoreValueChanged } from "../../state/store/ngReduxHelper"

const REVERSE_ORDER = true
const KEEP_ORDER = false
const nameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

type CompareFunction = (a: CodeMapNode, b: CodeMapNode) => number

export class MapTreeViewController implements CodeMapPreRenderServiceSubscriber, SortingOptionSubscriber {
	private unsubscribeFromNgRedux: () => void
	private unsubscribeFromNgReduxValueChange: () => void
	private _viewModel: {
		rootNode: CodeMapNode
	} = {
		rootNode: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private storeService: StoreService,
		$ngRedux: ngRedux.INgRedux
	) {
		"ngInject"
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
		SortingOptionService.subscribe(this.$rootScope, this)

		this.unsubscribeFromNgReduxValueChange = onStoreValueChanged($ngRedux, selectSortingOrderAscending, () => {
			this.applySortOrderChange(this._viewModel.rootNode, REVERSE_ORDER)
		})
	}

	$onDestroy() {
		this.unsubscribeFromNgRedux()
		this.unsubscribeFromNgReduxValueChange()
	}

	onSortingOptionChanged(sortingOption: SortingOption) {
		const compareFunction: CompareFunction =
			sortingOption === SortingOption.NUMBER_OF_FILES
				? (a, b) => b.attributes[NodeMetricDataService.UNARY_METRIC] - a.attributes[NodeMetricDataService.UNARY_METRIC]
				: (a, b) => nameCollator.compare(a.name, b.name)
		this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, KEEP_ORDER, compareFunction)
	}

	onRenderMapChanged(map: CodeMapNode) {
		// TODO: Events should only be triggered if actually necessary.
		if (map === this._viewModel.rootNode) {
			// needed to prevent flashing since event is triggered 4 times
			return
		}

		// Clone the map to prevent changing the order of the original map.
		this._viewModel.rootNode = klona(map)

		this.synchronizeAngularTwoWayBinding()
		this.onSortingOptionChanged(this.storeService.getState().dynamicSettings.sortingOption)
	}

	private applySortOrderChange(node: CodeMapNode, reverse: boolean, compareFunction?: CompareFunction) {
		if (!node) {
			return
		}
		for (let index = 0; index < node.children.length; index++) {
			if (node.children[index].type === NodeType.FOLDER) {
				node.children[index] = this.applySortOrderChange(node.children[index], reverse, compareFunction)
			}
		}
		if (reverse) {
			node.children.reverse()
		} else {
			node.children = this.groupFilesAndFolders(node, compareFunction)
		}
		return node
	}

	private groupFilesAndFolders(node: CodeMapNode, compareFunction: CompareFunction) {
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
			const actualComparator = compareFunction
			compareFunction = (a, b) => -1 * actualComparator(a, b)
		}

		folders.sort(compareFunction)
		files.sort(compareFunction)

		folders.push(...files)

		return folders
	}

	// Todo: this can probably be removed, after all store listeneres are replaced through ng-redux
	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}
}

export const mapTreeViewComponent = {
	selector: "mapTreeViewComponent",
	template: require("./mapTreeView.component.html"),
	controller: MapTreeViewController
}
