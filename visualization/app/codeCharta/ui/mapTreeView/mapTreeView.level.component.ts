import { IRootScopeService } from "angular"
import { HideNodeContextMenuSubscriber, NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { isLeaf } from "../../util/codeMapHelper"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { setHoveredBuildingPath } from "../../state/store/lookUp/hoveredBuildingPath/hoveredBuildingPath.actions"

export class MapTreeViewLevelController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, HideNodeContextMenuSubscriber {
	private node: CodeMapNode = null

	private _viewModel: {
		isHoveredInCodeMap: boolean
		isHoveredInTreeView: boolean
		isMarked: boolean
		isFolderOpened: boolean
	} = {
		isHoveredInCodeMap: false,
		isHoveredInTreeView: false,
		isMarked: false,
		isFolderOpened: false
	}

	constructor(
		private $rootScope: IRootScopeService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private storeService: StoreService
	) {
		"ngInject"
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		NodeContextMenuController.subscribeToHideNodeContextMenu(this.$rootScope, this)
	}

	onHideNodeContextMenu() {
		this._viewModel.isMarked = false
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.isHoveredInCodeMap = Boolean(this.node?.path && hoveredBuilding.node?.path === this.node.path)
	}

	onBuildingUnhovered() {
		this._viewModel.isHoveredInCodeMap = false
	}

	onMouseEnter() {
		this.storeService.dispatch(setHoveredBuildingPath(this.node.path))
		this._viewModel.isHoveredInTreeView = true
	}

	onMouseLeave() {
		this.storeService.dispatch(setHoveredBuildingPath(null))
		this._viewModel.isHoveredInTreeView = false
	}

	openNodeContextMenu($event) {
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
