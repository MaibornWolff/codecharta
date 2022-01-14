import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { hoveredBuildingPathSelector } from "../../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.selector"
import { setHoveredBuildingPath } from "../../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import { NodeContextMenuController } from "../../nodeContextMenu/nodeContextMenu.component"

@Component({
	selector: "cc-map-tree-view-level",
	template: require("./mapTreeViewLevel.component.html")
})
export class MapTreeViewLevelComponent implements OnInit {
	@Input() node: CodeMapNode
	@Input() depth: number

	hoveredBuildingPath$: Observable<string | null>

	isOpen = false
	isContextMenuOpenForNode = false

	constructor(@Inject(Store) private store: Store) {
		this.hoveredBuildingPath$ = this.store.select(hoveredBuildingPathSelector)

		NodeContextMenuController.subscribeToHideNodeContextMenu(undefined, this)
	}

	ngOnInit(): void {
		// open root folder initially
		if (this.depth === 0) {
			this.isOpen = true
		}
	}

	onHideNodeContextMenu() {
		this.isContextMenuOpenForNode = false
	}

	onMouseEnter() {
		this.store.dispatch(setHoveredBuildingPath(this.node.path))
	}

	onMouseLeave() {
		this.store.dispatch(setHoveredBuildingPath(null))
	}

	openNodeContextMenu = $event => {
		$event.stopPropagation()
		$event.preventDefault()

		this.isContextMenuOpenForNode = true
		NodeContextMenuController.broadcastShowEvent(undefined, this.node.path, this.node.type, $event.clientX, $event.clientY)

		document.querySelector(".tree-element-0").addEventListener("scroll", this.scrollFunction)
	}

	toggleOpen() {
		this.isOpen = !this.isOpen
	}

	private scrollFunction = () => {
		NodeContextMenuController.broadcastHideEvent()
		document.querySelector(".tree-element-0").removeEventListener("scroll", this.scrollFunction)
	}
}
