import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapNode, NodeType, SortingOption } from "../../codeCharta.model"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import {
	SortingDialogOptionService,
	SortingDialogOptionSubscriber
} from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.service"
import {
	SortingOrderAscendingService,
	SortingOrderAscendingSubscriber
} from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"
import { setSortingDialogOption } from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.actions"
import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"

export class MapTreeViewController
	implements CodeMapPreRenderServiceSubscriber, SortingDialogOptionSubscriber, SortingOrderAscendingSubscriber {
	private _viewModel: {
		rootNode: CodeMapNode
	} = {
		rootNode: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
		SortingDialogOptionService.subscribe(this.$rootScope, this)
		SortingOrderAscendingService.subscribe(this.$rootScope, this)
	}

	public onSortingDialogOptionChanged(sortingDialogOption: SortingOption) {
		if (sortingDialogOption === SortingOption.NUMBER_OF_FILES) {
			this._viewModel.rootNode = this.applySortOrderChange(
				this._viewModel.rootNode,
				(a, b) => b.attributes["unary"] - a.attributes["unary"],
				false
			)
			return
		}
		this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, (a, b) => (b.name > a.name ? 0 : 1), false)
	}

	public onSortingOrderAscendingChanged(sortingOrderAscending: boolean) {
		this._viewModel.rootNode = this.applySortOrderChange(this._viewModel.rootNode, null, true)
	}

	public applySortOrderChange(node: CodeMapNode, compareFn: (a: CodeMapNode, b: CodeMapNode) => number, reverse: boolean) {
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
		return folders.concat(files)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		if (map === this._viewModel.rootNode) {
			// needed to prevent flashing since event is triggered 4 times
			return
		}
		this._viewModel.rootNode = map
		this.synchronizeAngularTwoWayBinding()

		this.storeService.dispatch(setSortingDialogOption(this.storeService.getState().dynamicSettings.sortingDialogOption))
		if (this.storeService.getState().appSettings.sortingOrderAscending) {
			this.storeService.dispatch(setSortingOrderAscending(this.storeService.getState().appSettings.sortingOrderAscending))
		}
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
