import "./nodeContextMenu.component.scss"
import angular, { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { BlacklistItem, BlacklistType, CodeMapNode, MapColors, NodeType } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { addBlacklistItem, removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { focusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { BuildingRightClickedEventSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { MapColorsService, MapColorsSubscriber } from "../../state/store/appSettings/mapColors/mapColors.service"
import { Vector2 } from "three"
import {
	FocusedNodePathService,
	FocusNodeSubscriber,
	UnfocusNodeSubscriber
} from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { MarkedPackagesService, MarkedPackagesSubscriber } from "../../state/store/fileSettings/markedPackages/markedPackages.service"

export interface ShowNodeContextMenuSubscriber {
	onShowNodeContextMenu(path: string, type: string, x: number, y: number)
}

export interface HideNodeContextMenuSubscriber {
	onHideNodeContextMenu(mousePosition: Vector2)
}

export class NodeContextMenuController
	implements
		BuildingRightClickedEventSubscriber,
		ShowNodeContextMenuSubscriber,
		HideNodeContextMenuSubscriber,
		MapColorsSubscriber,
		FocusNodeSubscriber,
		UnfocusNodeSubscriber,
		BlacklistSubscriber,
		MarkedPackagesSubscriber {
	private static SHOW_NODE_CONTEXT_MENU_EVENT = "show-node-context-menu"
	private static HIDE_NODE_CONTEXT_MENU_EVENT = "hide-node-context-menu"

	private _viewModel: {
		codeMapNode: CodeMapNode
		markingColors: string[]
	} = {
		codeMapNode: null,
		markingColors: null
	}

	/* @ngInject */
	constructor(
		private $element: Element,
		private $timeout,
		private $window,
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapActionsService: CodeMapActionsService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		MapColorsService.subscribe(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingRightClickedEvents(this.$rootScope, this)
		NodeContextMenuController.subscribeToShowNodeContextMenu(this.$rootScope, this)
		NodeContextMenuController.subscribeToHideNodeContextMenu(this.$rootScope, this)
		BlacklistService.subscribe($rootScope, this)
		FocusedNodePathService.subscribeToFocusNode($rootScope, this)
		FocusedNodePathService.subscribeToUnfocusNode($rootScope, this)
		MarkedPackagesService.subscribe($rootScope, this)

		document.body.addEventListener(
			"click",
			event => NodeContextMenuController.broadcastHideEvent(this.$rootScope, new Vector2(event.x, event.y)),
			true
		)
	}

	onMapColorsChanged(mapColors: MapColors) {
		this._viewModel.markingColors = mapColors.markingColors
	}

	onBlacklistChanged() {
		this.onHideNodeContextMenu()
	}

	onFocusNode() {
		this.onHideNodeContextMenu()
	}

	onUnfocusNode() {
		this.onHideNodeContextMenu()
	}

	onMarkedPackagesChanged() {
		this.onHideNodeContextMenu()
	}

	onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number) {
		const nodeType = building.node.isLeaf ? NodeType.FILE : NodeType.FOLDER
		this.onShowNodeContextMenu(building.node.path, nodeType, x, y)
	}

	onShowNodeContextMenu(path: string, nodeType: string, mouseX: number, mouseY: number) {
		NodeContextMenuController.broadcastHideEvent(this.$rootScope)
		this._viewModel.codeMapNode = CodeMapHelper.getCodeMapNodeFromPath(path, nodeType, this.codeMapPreRenderService.getRenderMap())
		const { x, y } = this.calculatePosition(mouseX, mouseY)
		this.setPosition(x, y)
		this.synchronizeAngularTwoWayBinding()
	}

	onHideNodeContextMenu(mousePosition = new Vector2(-1, -1)) {
		if (this.isClickInsideNodeContextMenu(mousePosition)) {
			this._viewModel.codeMapNode = null
			this.synchronizeAngularTwoWayBinding()
		}
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

	flattenNode() {
		const blacklistItem: BlacklistItem = { path: this._viewModel.codeMapNode.path, type: BlacklistType.flatten }
		this.storeService.dispatch(addBlacklistItem(blacklistItem))
	}

	showNode() {
		const blacklistItem: BlacklistItem = { path: this._viewModel.codeMapNode.path, type: BlacklistType.flatten }
		this.storeService.dispatch(removeBlacklistItem(blacklistItem))
	}

	clickColor(color: string) {
		if (this.isNodeOrParentMarked(color)) {
			this.unmarkFolder()
		} else {
			this.markFolder(color)
		}
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

	private isClickInsideNodeContextMenu(mousePosition: Vector2) {
		const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = document.getElementById("codemap-context-menu")
		return (
			mousePosition.x < offsetLeft ||
			mousePosition.x > offsetLeft + offsetWidth ||
			mousePosition.y < offsetTop ||
			mousePosition.y > offsetTop + offsetHeight
		)
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

	markFolder(color: string) {
		this.codeMapActionsService.markFolder(this._viewModel.codeMapNode, color)
	}

	unmarkFolder() {
		this.codeMapActionsService.unmarkFolder(this._viewModel.codeMapNode)
	}

	focusNode() {
		this.storeService.dispatch(focusNode(this._viewModel.codeMapNode.path))
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

	excludeNode() {
		this.storeService.dispatch(
			addBlacklistItem({
				path: this._viewModel.codeMapNode.path,
				type: BlacklistType.exclude
			})
		)
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

	static broadcastHideEvent($rootScope: IRootScopeService, mousePosition = new Vector2(-1, -1)) {
		$rootScope.$broadcast(NodeContextMenuController.HIDE_NODE_CONTEXT_MENU_EVENT, { mousePosition })
	}

	static subscribeToShowNodeContextMenu($rootScope: IRootScopeService, subscriber: ShowNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, (_event, data) => {
			subscriber.onShowNodeContextMenu(data.path, data.type, data.x, data.y)
		})
	}

	static subscribeToHideNodeContextMenu($rootScope: IRootScopeService, subscriber: HideNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.HIDE_NODE_CONTEXT_MENU_EVENT, (_event, data) => {
			subscriber.onHideNodeContextMenu(data.mousePosition)
		})
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
