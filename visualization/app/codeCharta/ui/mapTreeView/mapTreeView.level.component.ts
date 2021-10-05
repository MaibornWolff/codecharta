import { IRootScopeService } from "angular"
import { HideNodeContextMenuSubscriber, NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { isLeaf } from "../../util/codeMapHelper"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { hoveredBuildingPathSelector } from "../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.selector"
import { setHoveredBuildingPath } from "../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"

export class MapTreeViewLevelController implements HideNodeContextMenuSubscriber {
	private node: CodeMapNode = null

	private _viewModel: {
		isHovered: boolean
		isMarked: boolean
		isFolderOpened: boolean
	} = {
		isHovered: false,
		isMarked: false,
		isFolderOpened: false
	}

	constructor(
		private $rootScope: IRootScopeService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private storeService: StoreService
	) {
		"ngInject"
		NodeContextMenuController.subscribeToHideNodeContextMenu(this.$rootScope, this)
		// temporary use private field until component is migrated to Angular and can normally connect
		this.storeService["store"].subscribe(() => {
			const state = this.storeService["store"].getState()
			const hoveredBuildingPath = hoveredBuildingPathSelector(state)
			const isHovered = Boolean(this.node?.path && hoveredBuildingPath === this.node.path)
			if (isHovered !== this._viewModel.isHovered) this._viewModel.isHovered = isHovered
		})
	}

	onHideNodeContextMenu() {
		this._viewModel.isMarked = false
	}

	onMouseEnter() {
		this.storeService.dispatch(setHoveredBuildingPath(this.node?.path))
	}

	onMouseLeave() {
		this.storeService.dispatch(setHoveredBuildingPath(null))
	}

	openNodeContextMenu = $event => {
		$event.stopPropagation()
		NodeContextMenuController.broadcastShowEvent(this.$rootScope, this.node.path, this.node.type, $event.clientX, $event.clientY)
		this._viewModel.isMarked = true
		document.getElementById("tree-root").addEventListener("scroll", this.scrollFunction)
	}

	onClickNode() {
		this._viewModel.isFolderOpened = !this._viewModel.isFolderOpened
	}

	isLeaf(node: CodeMapNode = this.node) {
		return isLeaf(node)
	}

	isSearched() {
		if (this.node && this.storeService.getState().dynamicSettings.searchedNodePaths) {
			return this.storeService.getState().dynamicSettings.searchedNodePaths.has(this.node.path)
		}
		return false
	}

	openRootFolderByDefault(depth: number) {
		if (depth === 0) {
			this._viewModel.isFolderOpened = true
		}
	}

	getNodeUnaryValue() {
		return this.node.attributes[NodeMetricDataService.UNARY_METRIC]
	}

	getUnaryPercentage() {
		const rootUnary = this.codeMapPreRenderService.getRenderMap().attributes[NodeMetricDataService.UNARY_METRIC]
		return ((100 * this.getNodeUnaryValue()) / rootUnary).toFixed(0)
	}

	private scrollFunction = () => {
		NodeContextMenuController.broadcastHideEvent(this.$rootScope)
		document.getElementById("tree-root").removeEventListener("scroll", this.scrollFunction)
	}
}

export const mapTreeViewLevelComponent = {
	selector: "mapTreeViewLevelComponent",
	template: require("./mapTreeView.level.component.html"),
	controller: MapTreeViewLevelController,
	bindings: {
		node: "<",
		depth: "<"
	}
}
