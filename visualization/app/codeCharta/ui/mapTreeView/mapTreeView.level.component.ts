import { NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { CodeMapNode } from "../../codeCharta.model"
import { setHoveredBuildingPath } from "../../state/store/lookUp/hoveredBuildingPath/hoveredBuildingPath.actions"
import { Component, Inject, Input, OnInit } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { Observable } from "rxjs"
import { hoveredBuildingPathSelector } from "../../state/store/lookUp/hoveredBuildingPath/hoveredBuildingPath.selector"

@Component({
	selector: "cc-map-tree-view-level",
	template: require("./mapTreeView.level.component.html")
})
export class MapTreeViewLevel implements OnInit {
	@Input() node: CodeMapNode
	@Input() depth: number
	hoveredBuildingId$: Observable<string | null>
	isMarked = false
	isFolderOpen = false

	constructor(@Inject(Store) private store: Store) {
		this.hoveredBuildingId$ = this.store.select(hoveredBuildingPathSelector)
	}

	ngOnInit() {
		if (this.depth === 0) this.isFolderOpen = true
	}

	// todo
	onHideNodeContextMenu() {
		this.isMarked = false
	}

	onMouseEnter() {
		this.store.dispatch(setHoveredBuildingPath(this.node.path))
	}

	onMouseLeave() {
		this.store.dispatch(setHoveredBuildingPath(null))
	}

	openNodeContextMenu($event) {
		// console.log("hi from openNodeContextMenu")
		$event.stopPropagation()
		NodeContextMenuController.broadcastShowEvent2(this.node.path, this.node.type, $event.clientX, $event.clientY)
		this.isMarked = true
		document.getElementById("tree-root").addEventListener("scroll", this.hideContextMenuOnceOnScroll)
	}

	private hideContextMenuOnceOnScroll = () => {
		NodeContextMenuController.broadcastHideEvent2()
		document.getElementById("tree-root").removeEventListener("scroll", this.hideContextMenuOnceOnScroll)
	}

	onClickNode() {
		this.isFolderOpen = !this.isFolderOpen
	}

	isSearched() {
		// todo
		// if (this.node && this.storeService.getState().dynamicSettings.searchedNodePaths) {
		// 	return this.storeService.getState().dynamicSettings.searchedNodePaths.has(this.node.path)
		// }
		return false
	}
}
