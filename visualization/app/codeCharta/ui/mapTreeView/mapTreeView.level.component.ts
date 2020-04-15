import { IRootScopeService } from "angular"
import { NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { addBlacklistItem, removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { focusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
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
		collapsed: boolean
	} = {
		isHoveredInCodeMap: false,
		collapsed: true
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
		// TODO: set a 'black' color in settings.mapColors ?
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
	}

	public onMouseLeave() {
		this.$rootScope.$broadcast(MapTreeViewLevelController.MAP_TREE_VIEW_UNHOVER_NODE_EVENT, this.node)
	}

	public onRightClick($event) {
		NodeContextMenuController.broadcastShowEvent(this.$rootScope, this.node.path, this.node.type, $event.clientX, $event.clientY)
	}

	public onFolderClick() {
		this._viewModel.collapsed = !this._viewModel.collapsed
	}

	public onLabelClick() {
		this.storeService.dispatch(focusNode(this.node.path))
	}

	public onEyeClick() {
		const blacklistItem: BlacklistItem = { path: this.node.path, type: BlacklistType.flatten }
		if (this.node.visible) {
			this.storeService.dispatch(addBlacklistItem(blacklistItem))
		} else {
			this.storeService.dispatch(removeBlacklistItem(blacklistItem))
		}
	}

	public isLeaf(node: CodeMapNode = this.node): boolean {
		return !(node && node.children && node.children.length > 0)
	}

	public isBlacklisted(node: CodeMapNode): boolean {
		if (node) {
			return CodeMapHelper.isBlacklisted(node, this.storeService.getState().fileSettings.blacklist, BlacklistType.exclude)
		}
		return false
	}

	public isSearched(node: CodeMapNode): boolean {
		if (node != null && this.storeService.getState().dynamicSettings.searchedNodePaths) {
			return this.storeService.getState().dynamicSettings.searchedNodePaths.has(node.path)
		}
		return false
	}

	public openRootFolderByDefault(depth: number) {
		if (depth == 0) {
			this._viewModel.collapsed = false
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
		$rootScope.$on("should-hover-node", (event, args) => subscriber.onShouldHoverNode(args))
		$rootScope.$on("should-unhover-node", (event, args) => subscriber.onShouldUnhoverNode(args))
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
