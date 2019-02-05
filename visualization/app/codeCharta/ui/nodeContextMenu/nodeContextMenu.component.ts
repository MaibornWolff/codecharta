import "./nodeContextMenu.component.scss"
import { SettingsService } from "../../core/settings/settings.service"
import angular from "angular"
import { highlightColors } from "../codeMap/rendering/renderSettings"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapUtilService } from "../codeMap/codeMap.util.service"

export class NodeContextMenuController {
	private contextMenuBuilding
	public amountOfDependentEdges
	public amountOfVisibleDependentEdges
	public anyEdgeIsVisible

	private colors = highlightColors

	/* @ngInject */
	constructor(
		private $element: Element,
		private $timeout,
		private $window,
		private $rootScope,
		private settingsService: SettingsService,
		private codeMapActionsService: CodeMapActionsService,
		private codeMapUtilService: CodeMapUtilService
	) {
		this.$rootScope.$on("show-node-context-menu", (e, data) => {
			this.show(data.path, data.type, data.x, data.y)
		})
		this.$rootScope.$on("hide-node-context-menu", () => {
			this.hide()
		})
	}

	public static broadcastShowEvent($rootScope, path: string, type: string, x, y) {
		$rootScope.$broadcast("show-node-context-menu", { path: path, type: type, x: x, y: y })
	}

	public static broadcastHideEvent($rootScope) {
		$rootScope.$broadcast("hide-node-context-menu")
	}

	show(path: string, nodeType: string, mouseX: number, mouseY: number) {
		this.$timeout(() => {
			this.contextMenuBuilding = this.codeMapUtilService.getCodeMapNodeFromPath(path, nodeType)
		}, 50).then(() => {
			this.amountOfDependentEdges = this.codeMapActionsService.amountOfDependentEdges(this.contextMenuBuilding)
			this.amountOfVisibleDependentEdges = this.codeMapActionsService.amountOfVisibleDependentEdges(this.contextMenuBuilding)
			this.anyEdgeIsVisible = this.codeMapActionsService.anyEdgeIsVisible()
			const { x, y } = this.calculatePosition(mouseX, mouseY)
			this.setPosition(x, y)
		})
	}

	calculatePosition(mouseX: number, mouseY: number) {
		const w = this.$element[0].children[0].clientWidth
		const h = this.$element[0].children[0].clientHeight
		return {
			x: Math.min(mouseX, this.$window.innerWidth - w),
			y: Math.min(mouseY, this.$window.innerHeight - h)
		}
	}

	setPosition(x: number, y: number) {
		angular.element(this.$element[0].children[0]).css("top", y + "px")
		angular.element(this.$element[0].children[0]).css("left", x + "px")
	}

	hideNode() {
		this.hide()
		this.codeMapActionsService.hideNode(this.contextMenuBuilding)
	}

	showNode() {
		this.hide()
		this.codeMapActionsService.showNode(this.contextMenuBuilding)
	}

	clickColor(color: string) {
		if (this.currentFolderIsMarkedWithColor(color)) {
			this.unmarkFolder()
		} else {
			this.markFolder(color)
		}
	}

	currentFolderIsMarkedWithColor(color: string) {
		return (
			color &&
			this.contextMenuBuilding &&
			this.contextMenuBuilding.markingColor &&
			color.substring(1) === this.contextMenuBuilding.markingColor.substring(2)
		)
	}

	markFolder(color: string) {
		this.hide()
		this.codeMapActionsService.markFolder(this.contextMenuBuilding, color)
	}

	unmarkFolder() {
		this.hide()
		this.codeMapActionsService.unmarkFolder(this.contextMenuBuilding)
	}

	focusNode() {
		this.hide()
		this.codeMapActionsService.focusNode(this.contextMenuBuilding)
	}

	hide() {
		this.$timeout(() => {
			this.contextMenuBuilding = null
		}, 0)
	}

	showDependentEdges() {
		this.hide()
		this.codeMapActionsService.showDependentEdges(this.contextMenuBuilding)
	}

	hideDependentEdges() {
		this.hide()
		this.codeMapActionsService.hideDependentEdges(this.contextMenuBuilding)
	}

	hideAllEdges() {
		this.hide()
		this.codeMapActionsService.hideAllEdges()
	}

	excludeNode() {
		this.hide()
		this.codeMapActionsService.excludeNode(this.contextMenuBuilding)
	}

	nodeIsFolder() {
		return this.contextMenuBuilding && this.contextMenuBuilding.children && this.contextMenuBuilding.children.length > 0
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
