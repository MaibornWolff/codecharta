import "./nodeContextMenu.component.scss"
import angular, { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { BlacklistItem, BlacklistType, CodeMapNode, MapColors, NodeType } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { addBlacklistItem, removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { focusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { BuildingRightClickedEventSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { MapColorsService, MapColorsSubscriber } from "../../state/store/appSettings/mapColors/mapColors.service"
import { getCodeMapNodeFromPath } from "../../util/codeMapHelper"
import {ThreeSceneService} from "../codeMap/threeViewer/threeSceneService";

export enum ClickType {
	RightClick = 2
}


export interface ShowNodeContextMenuSubscriber {
	onShowNodeContextMenu(path: string, type: string, x: number, y: number)
}

export interface HideNodeContextMenuSubscriber {
	onHideNodeContextMenu()
}

export class NodeContextMenuController
	implements BuildingRightClickedEventSubscriber, ShowNodeContextMenuSubscriber, HideNodeContextMenuSubscriber, MapColorsSubscriber {
	private static SHOW_NODE_CONTEXT_MENU_EVENT = "show-node-context-menu"
	private static HIDE_NODE_CONTEXT_MENU_EVENT = "hide-node-context-menu"

	private _viewModel: {
		codeMapNode: CodeMapNode
		showNodeContextMenu: boolean
		markingColors: string[]
	} = {
		codeMapNode: null,
		showNodeContextMenu: false,
		markingColors: null
	}

	/* @ngInject */
	constructor(
		private $element: Element,
		private $timeout: ITimeoutService,
		private $window,
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapActionsService: CodeMapActionsService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private threeSceneService: ThreeSceneService
	) {
		MapColorsService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingRightClickedEvents(this.$rootScope, this)
		NodeContextMenuController.subscribeToShowNodeContextMenu(this.$rootScope, this)
		NodeContextMenuController.subscribeToHideNodeContextMenu(this.$rootScope, this)
	}

	onMapColorsChanged(mapColors: MapColors) {
		this._viewModel.markingColors = mapColors.markingColors
	}

	onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number) {
		const nodeType = building.node.isLeaf ? NodeType.FILE : NodeType.FOLDER
		this.onShowNodeContextMenu(building.node.path, nodeType, x, y)
	}

	onShowNodeContextMenu(path: string, nodeType: string, mouseX: number, mouseY: number) {
		this._viewModel.codeMapNode = getCodeMapNodeFromPath(path, nodeType, this.codeMapPreRenderService.getRenderMap())
		this._viewModel.showNodeContextMenu = true

		const { x, y } = this.calculatePosition(mouseX, mouseY)
		this.setPosition(x, y)

		this.synchronizeAngularTwoWayBinding()

		// Add event listeners, so that opened node context menu can be closed again later
		// when clicking (left or right button)
		// or using the mouse wheel on the body element.
		document.body.addEventListener("click", this.onBodyLeftClickHideNodeContextMenu, true)
		document.body.addEventListener("mousedown", this.onBodyRightClickHideNodeContextMenu, true)
		document.getElementById("codeMap").addEventListener("wheel", this.onMapWheelHideNodeContextMenu, true)
	}

	onBodyLeftClickHideNodeContextMenu = () => {
		// Just close node context menu, if you click anywhere on the map.
		NodeContextMenuController.broadcastHideEvent(this.$rootScope)

		// The listener is added when showing the node context menu.
		// Thus, remove the listener when clicking the body element with the left or right button
		// to fire hide events only (once) when it is really necessary.
		document.body.removeEventListener("click", this.onBodyLeftClickHideNodeContextMenu, true)
	}

	onBodyRightClickHideNodeContextMenu = event => {
		// On mouse down (right button), the menu must be hidden immediately.
		// Otherwise, if mouseup would be used and you would move the map with keeping the right button pressed,
		// the menu would not be closed.
		if (event.button === ClickType.RightClick) {
			NodeContextMenuController.broadcastHideEvent(this.$rootScope)
		}

		// The listener is added when showing the node context menu.
		// Thus, remove the listener when clicking the body element with the left or right button
		// to fire hide events only (once) when it is really necessary.
		document.body.removeEventListener("mousedown", this.onBodyRightClickHideNodeContextMenu, true)
	}

	addNodeToConstantHighlight(){
		this.threeSceneService.addNodeAndChildrenToConstantHighlight(this._viewModel.codeMapNode)
		this.onHideNodeContextMenu()

	}

	removeNodeFromConstantHighlight(){
		this.threeSceneService.removeNodeAndChildrenFromConstantHighlight(this._viewModel.codeMapNode)
		this.onHideNodeContextMenu()
	}

	onMapWheelHideNodeContextMenu = () => {
		// If you zoom in and out the map, the node context menu should be closed.
		NodeContextMenuController.broadcastHideEvent(this.$rootScope)

		// The listener is added when showing the node context menu.
		// Thus, remove the listener when using the mouse wheel on the body element
		// to fire hide events only (once) when it is really necessary.
		document.getElementById("codeMap").removeEventListener("wheel", this.onMapWheelHideNodeContextMenu, true)
	}

	onHideNodeContextMenu() {
		this._viewModel.showNodeContextMenu = false
		this.synchronizeAngularTwoWayBinding()
	}

	focusNode() {
		this.storeService.dispatch(focusNode(this._viewModel.codeMapNode.path))
	}

	flattenNode() {
		const blacklistItem: BlacklistItem = { path: this._viewModel.codeMapNode.path, type: BlacklistType.flatten }
		this.storeService.dispatch(addBlacklistItem(blacklistItem))
	}

	showFlattenedNode() {
		const blacklistItem: BlacklistItem = { path: this._viewModel.codeMapNode.path, type: BlacklistType.flatten }
		this.storeService.dispatch(removeBlacklistItem(blacklistItem))
	}

	excludeNode() {
		this.storeService.dispatch(
			addBlacklistItem({
				path: this._viewModel.codeMapNode.path,
				type: BlacklistType.exclude
			})
		)
	}

	clickColor(color: string) {
		if (this.isNodeOrParentMarked(color)) {
			this.unmarkFolder()
		} else {
			this.markFolder(color)
		}
	}

	markFolder(color: string) {
		this.codeMapActionsService.markFolder(this._viewModel.codeMapNode, color)
	}

	unmarkFolder() {
		this.codeMapActionsService.unmarkFolder(this._viewModel.codeMapNode)
	}

	calculatePosition(mouseX: number, mouseY: number) {
		const width = this.$element[0].children[0].clientWidth
		const height = this.$element[0].children[0].clientHeight
		return {
			x: Math.min(mouseX, this.$window.innerWidth - width),
			y: Math.min(mouseY, this.$window.innerHeight - height)
		}
	}

	setPosition(x: number, y: number) {
		angular.element(this.$element[0].children[0]).css("top", `${y}px`)
		angular.element(this.$element[0].children[0]).css("left", `${x}px`)
	}

	isNodeOrParentMarked(color?: string) {
		if (!color || !this._viewModel.codeMapNode) {
			return false
		}

		if (this.isNodeMarked()) {
			return this.packageMatchesColor(color)
		}
		return this.packageMatchesColorOfParentMP(color)
	}

	private isNodeMarked() {
		return this.storeService.getState().fileSettings.markedPackages.some(mp => mp.path === this._viewModel.codeMapNode.path)
	}

	private packageMatchesColor(color: string) {
		return this.storeService
			.getState()
			.fileSettings.markedPackages.some(mp => mp.path === this._viewModel.codeMapNode.path && mp.color === color)
	}

	private packageMatchesColorOfParentMP(color: string) {
		const index = this.codeMapActionsService.getParentMarkedPackageIndex(this._viewModel.codeMapNode.path)
		if (index === -1) {
			return false
		}
		return this.storeService.getState().fileSettings.markedPackages[index].color === color
	}

	isNodeConstantlyHighlighted(){
		if(this._viewModel.codeMapNode){			
			const {lookUp} = this.storeService.getState()
			const codeMapBuilding: CodeMapBuilding = lookUp.idToBuilding.get(this._viewModel.codeMapNode.id)
			if(codeMapBuilding){
				return this.threeSceneService.getConstantHighlight().has(codeMapBuilding.id)
			}
		}
		return false
	}

	isNodeOrParentFocused() {
		const { focusedNodePath } = this.storeService.getState().dynamicSettings
		return Boolean(focusedNodePath && this._viewModel.codeMapNode?.path.startsWith(focusedNodePath))
	}

	isNodeFocused() {
		if (this._viewModel.codeMapNode) {
			return this._viewModel.codeMapNode.path === this.storeService.getState().dynamicSettings.focusedNodePath
		}
		return false
	}

	nodeIsFolder() {
		return this._viewModel.codeMapNode?.children?.length > 0
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}

	static broadcastShowEvent($rootScope, path: string, type: string, x, y) {
		$rootScope.$broadcast(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, {
			path,
			type,
			x,
			y
		})
	}

	static broadcastHideEvent($rootScope: IRootScopeService) {
		$rootScope.$broadcast(NodeContextMenuController.HIDE_NODE_CONTEXT_MENU_EVENT)
	}

	static subscribeToShowNodeContextMenu($rootScope: IRootScopeService, subscriber: ShowNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, (_event, data) => {
			subscriber.onShowNodeContextMenu(data.path, data.type, data.x, data.y)
		})
	}

	static subscribeToHideNodeContextMenu($rootScope: IRootScopeService, subscriber: HideNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.HIDE_NODE_CONTEXT_MENU_EVENT, () => {
			subscriber.onHideNodeContextMenu()
		})
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
