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

export interface ShowNodeContextMenuSubscriber {
	onShowNodeContextMenu(path: string, type: string, x: number, y: number)
}

export class NodeContextMenuController implements BuildingRightClickedEventSubscriber, ShowNodeContextMenuSubscriber, MapColorsSubscriber {
	private static SHOW_NODE_CONTEXT_MENU_EVENT = "show-node-context-menu"

	private _viewModel: {
		contextMenuBuilding: CodeMapNode
		markingColors: string[]
	} = {
		contextMenuBuilding: null,
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

		document.body.addEventListener("click", () => this.hideNodeContextMenu(), true)
	}

	public onMapColorsChanged(mapColors: MapColors) {
		this._viewModel.markingColors = mapColors.markingColors
	}

	public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number) {
		const nodeType = building.node.isLeaf ? NodeType.FILE : NodeType.FOLDER
		NodeContextMenuController.broadcastShowEvent(this.$rootScope, building.node.path, nodeType, x, y)
	}

	public onShowNodeContextMenu(path: string, nodeType: string, mouseX: number, mouseY: number) {
		this._viewModel.contextMenuBuilding = CodeMapHelper.getCodeMapNodeFromPath(
			path,
			nodeType,
			this.codeMapPreRenderService.getRenderMap()
		)
		const { x, y } = this.calculatePosition(mouseX, mouseY)
		this.setPosition(x, y)
		this.synchronizeAngularTwoWayBinding()
	}

	public calculatePosition(mouseX: number, mouseY: number) {
		const width = this.$element[0].children[0].clientWidth
		const height = this.$element[0].children[0].clientHeight
		return {
			x: Math.min(mouseX, this.$window.innerWidth - width),
			y: Math.min(mouseY, this.$window.innerHeight - height)
		}
	}

	public setPosition(x: number, y: number) {
		angular.element(this.$element[0].children[0]).css("top", y + "px")
		angular.element(this.$element[0].children[0]).css("left", x + "px")
	}

	public hideNodeContextMenu() {
		this._viewModel.contextMenuBuilding = null
		this.synchronizeAngularTwoWayBinding()
	}

	public flattenNode() {
		const blacklistItem: BlacklistItem = { path: this._viewModel.contextMenuBuilding.path, type: BlacklistType.flatten }
		this.storeService.dispatch(addBlacklistItem(blacklistItem))
		this.hideNodeContextMenu()
	}

	public showNode() {
		const blacklistItem: BlacklistItem = { path: this._viewModel.contextMenuBuilding.path, type: BlacklistType.flatten }
		this.storeService.dispatch(removeBlacklistItem(blacklistItem))
		this.hideNodeContextMenu()
	}

	public clickColor(color: string) {
		if (this.currentFolderIsMarkedWithColor(color)) {
			this.unmarkFolder()
		} else {
			this.markFolder(color)
		}
	}

	public currentFolderIsMarkedWithColor(color: string): boolean {
		if (!color || !this._viewModel.contextMenuBuilding) {
			return false
		}

		if (this.packageIsMarked()) {
			return this.packageMatchesColor(color)
		} else {
			return this.packageMatchesColorOfParentMP(color)
		}
	}

	private packageIsMarked(): boolean {
		return !!this.storeService.getState().fileSettings.markedPackages.find(mp => mp.path == this._viewModel.contextMenuBuilding.path)
	}

	private packageMatchesColor(color: string): boolean {
		return !!this.storeService
			.getState()
			.fileSettings.markedPackages.find(mp => mp.path == this._viewModel.contextMenuBuilding.path && mp.color == color)
	}

	private packageMatchesColorOfParentMP(color: string): boolean {
		const parentMP = this.codeMapActionsService.getParentMP(this._viewModel.contextMenuBuilding.path)
		return !!this.storeService
			.getState()
			.fileSettings.markedPackages.find(mp => parentMP && mp.path == parentMP.path && mp.color == color)
	}

	public markFolder(color: string) {
		this.codeMapActionsService.markFolder(this._viewModel.contextMenuBuilding, color)
		this.hideNodeContextMenu()
	}

	public unmarkFolder() {
		this.codeMapActionsService.unmarkFolder(this._viewModel.contextMenuBuilding)
		this.hideNodeContextMenu()
	}

	public focusNode() {
		this.storeService.dispatch(focusNode(this._viewModel.contextMenuBuilding.path))
		this.hideNodeContextMenu()
	}

	public excludeNode() {
		this.storeService.dispatch(addBlacklistItem({ path: this._viewModel.contextMenuBuilding.path, type: BlacklistType.exclude }))
		this.hideNodeContextMenu()
	}

	public nodeIsFolder() {
		return (
			this._viewModel.contextMenuBuilding &&
			this._viewModel.contextMenuBuilding.children &&
			this._viewModel.contextMenuBuilding.children.length > 0
		)
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}

	public static broadcastShowEvent($rootScope, path: string, type: string, x, y) {
		$rootScope.$broadcast(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, {
			path: path,
			type: type,
			x: x,
			y: y
		})
	}

	public static subscribeToShowNodeContextMenu($rootScope: IRootScopeService, subscriber: ShowNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, (event, data) => {
			subscriber.onShowNodeContextMenu(data.path, data.type, data.x, data.y)
		})
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
