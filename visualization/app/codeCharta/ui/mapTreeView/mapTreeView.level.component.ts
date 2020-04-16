import { IRootScopeService } from "angular"
import { NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { BlacklistType, CodeMapNode } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { MetricService } from "../../state/metric.service"

export interface MapTreeViewHoverEventSubscriber {
	onShouldHoverNode(node: CodeMapNode)
	onShouldUnhoverNode(node: CodeMapNode)
}

export class MapTreeViewLevelController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private static MAP_TREE_VIEW_HOVER_NODE_EVENT = "should-hover-node"
	private static MAP_TREE_VIEW_UNHOVER_NODE_EVENT = "should-unhover-node"

	private node: CodeMapNode = null

	private _viewModel: {
		isHoveredInCodeMap: boolean
		isHoveredInTreeView: boolean
		isFolderOpened: boolean
	} = {
		isHoveredInCodeMap: false,
		isHoveredInTreeView: false,
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
	}

	public getMarkingColor() {
		let defaultColor = "#000000"
		const markingColor = CodeMapHelper.getMarkingColor(this.node, this.storeService.getState().fileSettings.markedPackages)
		return markingColor ? markingColor : defaultColor
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.isHoveredInCodeMap = !!(
			this.node &&
			this.node.path &&
			hoveredBuilding.node &&
			hoveredBuilding.node.path === this.node.path
		)
	}

	public onBuildingUnhovered() {
		this._viewModel.isHoveredInCodeMap = false
	}

	public onMouseEnter() {
		this.$rootScope.$broadcast(MapTreeViewLevelController.MAP_TREE_VIEW_HOVER_NODE_EVENT, this.node)
		this._viewModel.isHoveredInTreeView = true
	}

	public onMouseLeave() {
		this.$rootScope.$broadcast(MapTreeViewLevelController.MAP_TREE_VIEW_UNHOVER_NODE_EVENT, this.node)
		this._viewModel.isHoveredInTreeView = false
	}

	public openNodeContextMenu($event) {
		$event.stopPropagation()
		NodeContextMenuController.broadcastShowEvent(this.$rootScope, this.node.path, this.node.type, $event.clientX, $event.clientY)
	}

	public onClickNode() {
		this._viewModel.isFolderOpened = !this._viewModel.isFolderOpened
	}

	public isLeaf(node: CodeMapNode = this.node): boolean {
		return !(node && node.children && node.children.length > 0)
	}

	public isFlattened() {
		return CodeMapHelper.isBlacklisted(this.node, this.storeService.getState().fileSettings.blacklist, BlacklistType.flatten)
	}

	public isExcluded(): boolean {
		if (this.node) {
			return CodeMapHelper.isBlacklisted(this.node, this.storeService.getState().fileSettings.blacklist, BlacklistType.exclude)
		}
		return false
	}

	public isSearched(): boolean {
		if (this.node != null && this.storeService.getState().dynamicSettings.searchedNodePaths) {
			return this.storeService.getState().dynamicSettings.searchedNodePaths.filter(path => path == this.node.path).length > 0
		}
		return false
	}

	public openRootFolderByDefault(depth: number) {
		if (depth == 0) {
			this._viewModel.isFolderOpened = true
		}
	}

	public getNodeUnaryValue() {
		return this.node.attributes[MetricService.UNARY_METRIC]
	}

	public getUnaryPercentage() {
		const rootUnary = this.codeMapPreRenderService.getRenderMap().attributes[MetricService.UNARY_METRIC]
		return ((100 * this.getNodeUnaryValue()) / rootUnary).toFixed(0)
	}

	public isRoot() {
		return this.node.path.split("/").length === 2
	}

	public static subscribeToHoverEvents($rootScope: IRootScopeService, subscriber: MapTreeViewHoverEventSubscriber) {
		$rootScope.$on(MapTreeViewLevelController.MAP_TREE_VIEW_HOVER_NODE_EVENT, (event, data) => {
			subscriber.onShouldHoverNode(data)
		})
		$rootScope.$on(MapTreeViewLevelController.MAP_TREE_VIEW_UNHOVER_NODE_EVENT, (event, data) => {
			subscriber.onShouldUnhoverNode(data)
		})
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
