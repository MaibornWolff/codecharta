import { IRootScopeService } from "angular"
import { HideNodeContextMenuSubscriber, NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { getMarkingColor, isLeaf } from "../../util/codeMapHelper"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

export interface MapTreeViewHoverEventSubscriber {
	onShouldHoverNode(node: CodeMapNode)
	onShouldUnhoverNode(node: CodeMapNode)
}

export class MapTreeViewLevelController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, HideNodeContextMenuSubscriber {
	private static MAP_TREE_VIEW_HOVER_NODE_EVENT = "should-hover-node"
	private static MAP_TREE_VIEW_UNHOVER_NODE_EVENT = "should-unhover-node"

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

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private storeService: StoreService
	) {
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
		this.$rootScope.$broadcast(MapTreeViewLevelController.MAP_TREE_VIEW_HOVER_NODE_EVENT, this.node)
		this._viewModel.isHoveredInTreeView = true
	}

	onMouseLeave() {
		this.$rootScope.$broadcast(MapTreeViewLevelController.MAP_TREE_VIEW_UNHOVER_NODE_EVENT, this.node)
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

	getMarkingColor() {
		const defaultColor = "#000000"
		const markingColor = getMarkingColor(this.node, this.storeService.getState().fileSettings.markedPackages)
		return markingColor ? markingColor : defaultColor
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

	static subscribeToHoverEvents($rootScope: IRootScopeService, subscriber: MapTreeViewHoverEventSubscriber) {
		$rootScope.$on(MapTreeViewLevelController.MAP_TREE_VIEW_HOVER_NODE_EVENT, (_event, data) => {
			subscriber.onShouldHoverNode(data)
		})
		$rootScope.$on(MapTreeViewLevelController.MAP_TREE_VIEW_UNHOVER_NODE_EVENT, (_event, data) => {
			subscriber.onShouldUnhoverNode(data)
		})
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
