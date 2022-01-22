import "./nodeContextMenu.component.scss"
import angular, { IRootScopeService } from "angular"
import { BlacklistItem, BlacklistType, CodeMapNode, NodeType } from "../../codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { addBlacklistItem, removeBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { getCodeMapNodeFromPath, isLeaf } from "../../util/codeMapHelper"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { DialogService } from "../dialog/dialog.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { ERROR_MESSAGES } from "../../util/fileValidator"
import { Store } from "../../state/store/store"
import { rightClickedNodeDataSelector } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import {
	RightClickedNodeData,
	setRightClickedNodeData
} from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"

export enum ClickType {
	RightClick = 2
}

export class NodeContextMenuController {
	private rightClickedNodeData: RightClickedNodeData

	private _viewModel: {
		codeMapNode: CodeMapNode
		nodePath: string
		lastPartOfNodePath: string
	} = {
		codeMapNode: null,
		nodePath: "",
		lastPartOfNodePath: ""
	}

	constructor(
		private $element: Element,
		private $window,
		public $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private threeSceneService: ThreeSceneService,
		private dialogService: DialogService,
		private blacklistService: BlacklistService
	) {
		"ngInject"
		Store.store.subscribe(() => {
			const state = Store.store.getState()
			const rightClickedNodeData = rightClickedNodeDataSelector(state)
			if (this.rightClickedNodeData === rightClickedNodeData) return

			this.rightClickedNodeData = rightClickedNodeData
			if (rightClickedNodeData === null) {
				this.hideNodeContextMenu()
			} else {
				const rightClickedNode = state.lookUp.idToNode.get(rightClickedNodeData.nodeId)
				const nodeType = isLeaf(rightClickedNode) ? NodeType.FILE : NodeType.FOLDER
				this.showNodeContextMenu(
					rightClickedNode.path,
					nodeType,
					rightClickedNodeData.xPositionOfRightClickEvent,
					rightClickedNodeData.yPositionOfRightClickEvent
				)
			}
		})
	}

	showNodeContextMenu(path: string, nodeType: string, mouseX: number, mouseY: number) {
		this._viewModel.codeMapNode = getCodeMapNodeFromPath(path, nodeType, this.codeMapPreRenderService.getRenderMap())
		this._viewModel.nodePath = path
		this._viewModel.lastPartOfNodePath = `${path.lastIndexOf("/") === 0 ? "" : "..."}${path.slice(path.lastIndexOf("/"))}`

		const { x, y } = this.calculatePosition(mouseX, mouseY)
		this.setPosition(x, y)

		// Add event listeners, so that opened node context menu can be closed again later
		// when clicking (left or right button) or using the mouse wheel on the body element.
		document.body.addEventListener("click", this.onBodyLeftClickHideNodeContextMenu, false)
		document.body.addEventListener("mousedown", this.onBodyRightClickHideNodeContextMenu, true)
		document.getElementById("codeMap").addEventListener("wheel", this.onMapWheelHideNodeContextMenu, true)
	}

	onBodyLeftClickHideNodeContextMenu = (mouseEvent: MouseEvent) => {
		if (this.isEventFromColorPicker(mouseEvent)) return

		// Just close node context menu, if you click anywhere on the map.
		this.hideNodeContextMenu()
	}

	onBodyRightClickHideNodeContextMenu = event => {
		// On mouse down (right button), the menu must be hidden immediately.
		// Otherwise, if mouseup would be used and you would move the map with keeping the right button pressed,
		// the menu would not be closed.
		if (event.button === ClickType.RightClick) {
			this.hideNodeContextMenu()
		}
	}

	onMapWheelHideNodeContextMenu = () => {
		// If you zoom in and out the map, the node context menu should be closed.
		this.hideNodeContextMenu()
	}

	hideNodeContextMenu = () => {
		this.storeService.dispatch(setRightClickedNodeData(null))

		// remove event listeners registered in showNodeContextMenu
		document.body.removeEventListener("click", this.onBodyLeftClickHideNodeContextMenu, true)
		document.body.removeEventListener("mousedown", this.onBodyRightClickHideNodeContextMenu, true)
		document.getElementById("codeMap").removeEventListener("wheel", this.onMapWheelHideNodeContextMenu, true)
	}

	flattenNode() {
		const codeMapNode = this._viewModel.codeMapNode
		const blacklistItem: BlacklistItem = {
			path: codeMapNode.path,
			type: BlacklistType.flatten,
			nodeType: codeMapNode.type
		}
		this.storeService.dispatch(addBlacklistItem(blacklistItem))
	}

	showFlattenedNode() {
		const codeMapNode = this._viewModel.codeMapNode
		const blacklistItem: BlacklistItem = {
			path: codeMapNode.path,
			type: BlacklistType.flatten,
			nodeType: codeMapNode.type
		}
		this.storeService.dispatch(removeBlacklistItem(blacklistItem))
	}

	excludeNode() {
		const codeMapNode = this._viewModel.codeMapNode
		const blacklistItem: BlacklistItem = {
			path: codeMapNode.path,
			type: BlacklistType.exclude,
			nodeType: codeMapNode.type
		}

		if (this.blacklistService.resultsInEmptyMap([blacklistItem])) {
			this.dialogService.showErrorDialog(ERROR_MESSAGES.blacklistError, "Blacklist Error")
		} else {
			this.storeService.dispatch(addBlacklistItem(blacklistItem))
		}
	}

	addNodeToConstantHighlight() {
		this.threeSceneService.addNodeAndChildrenToConstantHighlight(this._viewModel.codeMapNode)
		this.hideNodeContextMenu()
	}

	removeNodeFromConstantHighlight() {
		this.threeSceneService.removeNodeAndChildrenFromConstantHighlight(this._viewModel.codeMapNode)
		this.hideNodeContextMenu()
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

	private isEventFromColorPicker(mouseEvent: MouseEvent) {
		const elements = mouseEvent.composedPath() as Node[]
		return elements.some(element => element?.nodeName === "CC-COLOR-PICKER" || element?.nodeName === "COLOR-CHROME")
	}

	isNodeConstantlyHighlighted() {
		if (this._viewModel.codeMapNode) {
			const { lookUp } = this.storeService.getState()
			const codeMapBuilding: CodeMapBuilding = lookUp.idToBuilding.get(this._viewModel.codeMapNode.id)
			if (codeMapBuilding) {
				return this.threeSceneService.getConstantHighlight().has(codeMapBuilding.id)
			}
		}
		return false
	}

	nodeIsFolder() {
		return this._viewModel.codeMapNode?.children?.length > 0
	}
}

export const nodeContextMenuComponent = {
	selector: "nodeContextMenuComponent",
	template: require("./nodeContextMenu.component.html"),
	controller: NodeContextMenuController
}
