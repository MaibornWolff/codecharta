import "./nodeContextMenu.component.scss"
import angular from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapNode } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

export class NodeContextMenuController {
	private _viewModel: {
		amountOfDependentEdges: number
		amountOfVisibleDependentEdges: number
		anyEdgeIsVisible: boolean
		contextMenuBuilding: CodeMapNode
		markingColors: string[]
	} = {
		amountOfDependentEdges: null,
		amountOfVisibleDependentEdges: null,
		anyEdgeIsVisible: null,
		contextMenuBuilding: null,
		markingColors: null
	}

	/* @ngInject */
	constructor(
		private $element: Element,
		private $timeout,
		private $window,
		private $rootScope,
		private codeMapActionsService: CodeMapActionsService,
		private settingsService: SettingsService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		this.$rootScope.$on("show-node-context-menu", (e, data) => {
			this.show(data.path, data.type, data.x, data.y)
		})
		this.$rootScope.$on("hide-node-context-menu", () => {
			this.hide()
		})

		document.body.addEventListener("click", () => NodeContextMenuController.broadcastHideEvent(this.$rootScope), true)
		this._viewModel.markingColors = this.settingsService.getSettings().appSettings.mapColors.markingColors
	}

	public show(path: string, nodeType: string, mouseX: number, mouseY: number) {
		this.$timeout(() => {
			this._viewModel.contextMenuBuilding = CodeMapHelper.getCodeMapNodeFromPath(
				path,
				nodeType,
				this.codeMapPreRenderService.getRenderMap()
			)
		}, 50).then(() => {
			this._viewModel.amountOfDependentEdges = this.codeMapActionsService.amountOfDependentEdges(this._viewModel.contextMenuBuilding)
			this._viewModel.amountOfVisibleDependentEdges = this.codeMapActionsService.amountOfVisibleDependentEdges(
				this._viewModel.contextMenuBuilding
			)
			this._viewModel.anyEdgeIsVisible = this.codeMapActionsService.isAnyEdgeVisible()
			const { x, y } = this.calculatePosition(mouseX, mouseY)
			this.setPosition(x, y)
		})
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
		this.hide()
		this.codeMapActionsService.hideNode(this._viewModel.contextMenuBuilding)
	}

	public showNode() {
		this.hide()
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
		this.hide()
		this.codeMapActionsService.markFolder(this._viewModel.contextMenuBuilding, color)
	}

	public unmarkFolder() {
		this.hide()
		this.codeMapActionsService.unmarkFolder(this._viewModel.contextMenuBuilding)
	}

	public focusNode() {
		this.hide()
		this.codeMapActionsService.focusNode(this._viewModel.contextMenuBuilding)
	}

	public hide() {
		this.$timeout(() => {
			this._viewModel.contextMenuBuilding = null
		}, 0)
	}

	public showDependentEdges() {
		this.hide()
		this.codeMapActionsService.showDependentEdges(this._viewModel.contextMenuBuilding)
	}

	public hideDependentEdges() {
		this.hide()
		this.codeMapActionsService.hideDependentEdges(this._viewModel.contextMenuBuilding)
	}

	public hideAllEdges() {
		this.hide()
		this.codeMapActionsService.hideAllEdges()
	}

	public excludeNode() {
		this.hide()
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
		$rootScope.$broadcast("show-node-context-menu", { path: path, type: type, x: x, y: y })
	}

	public static broadcastHideEvent($rootScope) {
		$rootScope.$broadcast("hide-node-context-menu")
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
