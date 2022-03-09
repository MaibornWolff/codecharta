import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { hoveredBuildingPathSelector } from "../../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.selector"
import { setHoveredBuildingPath } from "../../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import {
	RightClickedNodeData,
	setRightClickedNodeData
} from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"

@Component({
	selector: "cc-map-tree-view-level",
	template: require("./mapTreeViewLevel.component.html")
})
export class MapTreeViewLevelComponent implements OnInit {
	@Input() node: CodeMapNode
	@Input() depth: number

	hoveredBuildingPath$: Observable<string | null>
	rightClickedNodeData$: Observable<RightClickedNodeData>

	isOpen = false

	constructor(@Inject(Store) private store: Store) {
		this.hoveredBuildingPath$ = this.store.select(hoveredBuildingPathSelector)
		this.rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
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

	openNodeContextMenu = $event => {
		$event.preventDefault()

		this.store.dispatch(
			setRightClickedNodeData({
				nodeId: this.node.id,
				xPositionOfRightClickEvent: $event.clientX,
				yPositionOfRightClickEvent: $event.clientY
			})
		)

		document.querySelector(".tree-element-0").addEventListener("scroll", this.scrollFunction)
	}

	toggleOpen() {
		this.isOpen = !this.isOpen
	}

	private scrollFunction = () => {
		this.store.dispatch(setRightClickedNodeData(null))
		document.querySelector(".tree-element-0").removeEventListener("scroll", this.scrollFunction)
	}
}
