import "./nodeContextMenu.component.scss"
import angular, { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

export interface ShowNodeContextMenuSubscriber {
	onShowNodeContextMenu(path: string, type: string, x: number, y: number)
}

export interface HideNodeContextMenuSubscriber {
	onHideNodeContextMenu()
}

export class NodeContextMenuController implements ShowNodeContextMenuSubscriber, HideNodeContextMenuSubscriber {
	private static SHOW_NODE_CONTEXT_MENU_EVENT = "show-node-context-menu"
	private static HIDE_NODE_CONTEXT_MENU_EVENT = "hide-node-context-menu"

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
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		NodeContextMenuController.subscribeToShowNodeContextMenu(this.$rootScope, this)
		NodeContextMenuController.subscribeToHideNodeContextMenu(this.$rootScope, this)

		document.body.addEventListener("click", () => this.onHideNodeContextMenu(), true)
		this._viewModel.markingColors = this.settingsService.getSettings().appSettings.mapColors.markingColors
	}

	public onShowNodeContextMenu(path: string, nodeType: string, mouseX: number, mouseY: number) {
		this.$timeout(() => {
			this._viewModel.contextMenuBuilding = CodeMapHelper.getCodeMapNodeFromPath(
				path,
				nodeType,
				this.codeMapPreRenderService.getRenderMap()
			)
		}, 50).then(() => {
			const { x, y } = this.calculatePosition(mouseX, mouseY)
			this.setPosition(x, y)
		})
	}

	public onHideNodeContextMenu() {
		this.$timeout(() => {
			this._viewModel.contextMenuBuilding = null
		}, 0)
	}

	public calculatePosition(mouseX: number, mouseY: number) {
		const w = this.$element[0].children[0].clientWidth
		const h = this.$element[0].children[0].clientHeight
		return {
			x: Math.min(mouseX, this.$window.innerWidth - w),
			y: Math.min(mouseY, this.$window.innerHeight - h)
		}
	}

	public setPosition(x: number, y: number) {
		angular.element(this.$element[0].children[0]).css("top", y + "px")
		angular.element(this.$element[0].children[0]).css("left", x + "px")
	}

	public hideNode() {
		this.onHideNodeContextMenu()
		this.codeMapActionsService.hideNode(this._viewModel.contextMenuBuilding)
	}

	public showNode() {
		this.onHideNodeContextMenu()
		this.codeMapActionsService.showNode(this._viewModel.contextMenuBuilding)
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
		return !!this.settingsService
			.getSettings()
			.fileSettings.markedPackages.find(mp => mp.path == this._viewModel.contextMenuBuilding.path)
	}

	private packageMatchesColor(color: string): boolean {
		return !!this.settingsService
			.getSettings()
			.fileSettings.markedPackages.find(mp => mp.path == this._viewModel.contextMenuBuilding.path && mp.color == color)
	}

	private packageMatchesColorOfParentMP(color: string): boolean {
		const s = this.settingsService.getSettings()
		const parentMP = this.codeMapActionsService.getParentMP(this._viewModel.contextMenuBuilding.path, s)
		return !!s.fileSettings.markedPackages.find(mp => parentMP && mp.path == parentMP.path && mp.color == color)
	}

	public markFolder(color: string) {
		this.onHideNodeContextMenu()
		this.codeMapActionsService.markFolder(this._viewModel.contextMenuBuilding, color)
	}

	public unmarkFolder() {
		this.onHideNodeContextMenu()
		this.codeMapActionsService.unmarkFolder(this._viewModel.contextMenuBuilding)
	}

	public focusNode() {
		this.onHideNodeContextMenu()
		this.codeMapActionsService.focusNode(this._viewModel.contextMenuBuilding)
	}

	public excludeNode() {
		this.onHideNodeContextMenu()
		this.codeMapActionsService.excludeNode(this._viewModel.contextMenuBuilding)
	}

	public nodeIsFolder() {
		return (
			this._viewModel.contextMenuBuilding &&
			this._viewModel.contextMenuBuilding.children &&
			this._viewModel.contextMenuBuilding.children.length > 0
		)
	}

	public static broadcastShowEvent($rootScope, path: string, type: string, x, y) {
		$rootScope.$broadcast(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, { path: path, type: type, x: x, y: y })
	}

	public static broadcastHideEvent($rootScope) {
		$rootScope.$broadcast(NodeContextMenuController.HIDE_NODE_CONTEXT_MENU_EVENT)
	}

	public static subscribeToShowNodeContextMenu($rootScope: IRootScopeService, subscriber: ShowNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.SHOW_NODE_CONTEXT_MENU_EVENT, (event, data) => {
			subscriber.onShowNodeContextMenu(data.path, data.type, data.x, data.y)
		})
	}

	public static subscribeToHideNodeContextMenu($rootScope: IRootScopeService, subscriber: HideNodeContextMenuSubscriber) {
		$rootScope.$on(NodeContextMenuController.HIDE_NODE_CONTEXT_MENU_EVENT, event => {
			subscriber.onHideNodeContextMenu()
		})
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
