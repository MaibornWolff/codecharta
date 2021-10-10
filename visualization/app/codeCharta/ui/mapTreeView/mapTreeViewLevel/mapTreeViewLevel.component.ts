import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { hoveredBuildingPathSelector } from "../../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.selector"
import { setHoveredBuildingPath } from "../../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import { rootUnarySelector } from "../../../state/selectors/accumulatedData/rootUnarySelector"

@Component({
	selector: "cc-map-tree-view-level",
	template: require("./mapTreeViewLevel.component.html")
})
export class MapTreeViewLevel implements OnInit {
	@Input() node: CodeMapNode
	@Input() depth: number

	hoveredBuildingPath$: Observable<string | null>
	rootUnary$: Observable<number>

	isOpen = false
	isContextMenuOpenForNode = false

	constructor(@Inject(Store) private store: Store) {
		this.hoveredBuildingPath$ = this.store.select(hoveredBuildingPathSelector)
		this.rootUnary$ = this.store.select(rootUnarySelector)

		// NodeContextMenuController.subscribeToHideNodeContextMenu(this.$rootScope, this)
		// onHideNodeContextMenu() {
		// 	this._viewModel.isMarked = false
		// }
	}

	ngOnInit(): void {
		// open root folder initially
		if (this.depth === 0) {
			this.isOpen = true
		}
	}

	onMouseEnter() {
		this.store.dispatch(setHoveredBuildingPath(this.node.path))
	}

	onMouseLeave() {
		this.store.dispatch(setHoveredBuildingPath(null))
	}

	openNodeContextMenu($event) {
		$event.stopPropagation()
		$event.preventDefault()
		// NodeContextMenuController.broadcastShowEvent(this.$rootScope, this.node.path, this.node.type, $event.clientX, $event.clientY)
		this.isContextMenuOpenForNode = true
		document.getElementById("tree-root").addEventListener("scroll", this.scrollFunction)
	}

	toggleOpen() {
		this.isOpen = !this.isOpen
	}

	private scrollFunction = () => {
		// NodeContextMenuController.broadcastHideEvent(this.$rootScope)
		document.getElementById("tree-root").removeEventListener("scroll", this.scrollFunction)
	}
}
