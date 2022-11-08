import { Component, Inject, Input, OnInit } from "@angular/core"

import { Store } from "../../../../state/angular-redux/store"
import { CodeMapNode } from "../../../../codeCharta.model"
import { setHoveredNodeId } from "../../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { hoveredNodeIdSelector } from "../../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

@Component({
	selector: "cc-map-tree-view-level",
	template: require("./mapTreeViewLevel.component.html")
})
export class MapTreeViewLevelComponent implements OnInit {
	@Input() node: CodeMapNode
	@Input() depth: number

	hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
	rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
	areaMetric$ = this.store.select(areaMetricSelector)

	isOpen = false

	areMetricGreaterZero = false

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		// open root folder initially
		this.isOpen = this.depth === 0
	}

	onMouseEnter() {
		this.store.dispatch(setHoveredNodeId(this.node.id))
	}

	onMouseLeave() {
		this.store.dispatch(setHoveredNodeId(null))
	}

	openNodeContextMenu = $event => {
		$event.preventDefault()
		$event.stopPropagation()

		this.areaMetric$.subscribe(
			areaMetricName =>
				(this.areMetricGreaterZero = this.node.attributes[areaMetricName] && this.node.attributes[areaMetricName] !== 0)
		)

		if (this.areMetricGreaterZero) {
			this.store.dispatch(
				setRightClickedNodeData({
					nodeId: this.node.id,
					xPositionOfRightClickEvent: $event.clientX,
					yPositionOfRightClickEvent: $event.clientY
				})
			)

			document.querySelector(".tree-element-0").addEventListener("scroll", this.scrollFunction)
		}
	}

	toggleOpen() {
		this.isOpen = !this.isOpen
	}

	private scrollFunction = () => {
		this.store.dispatch(setRightClickedNodeData(null))
		document.querySelector(".tree-element-0").removeEventListener("scroll", this.scrollFunction)
	}
}
