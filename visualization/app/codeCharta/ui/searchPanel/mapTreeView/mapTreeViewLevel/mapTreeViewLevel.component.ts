import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core"

import { CodeMapNode, State } from "../../../../codeCharta.model"
import { setHoveredNodeId } from "../../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { rightClickedNodeDataSelector } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { hoveredNodeIdSelector } from "../../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { Store } from "@ngrx/store"

@Component({
	selector: "cc-map-tree-view-level",
	templateUrl: "./mapTreeViewLevel.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MapTreeViewLevelComponent implements OnInit {
	@Input() node: CodeMapNode
	@Input() depth: number

	hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
	rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
	areaMetric$ = this.store.select(areaMetricSelector)

	isOpen = false

	areMetricGreaterZero = false

	constructor(private store: Store<State>) {}

	ngOnInit(): void {
		// open root folder initially
		this.isOpen = this.depth === 0
	}

	onMouseEnter() {
		this.store.dispatch(setHoveredNodeId({ value: this.node.id }))
	}

	onMouseLeave() {
		this.store.dispatch(setHoveredNodeId({ value: null }))
	}

	openNodeContextMenu = $event => {
		$event.preventDefault()
		$event.stopPropagation()

		this.areaMetric$
			.subscribe(
				areaMetricName =>
					(this.areMetricGreaterZero = this.node.attributes[areaMetricName] && this.node.attributes[areaMetricName] !== 0)
			)
			.unsubscribe()

		if (this.areMetricGreaterZero) {
			this.store.dispatch(
				setRightClickedNodeData({
					value: {
						nodeId: this.node.id,
						xPositionOfRightClickEvent: $event.clientX,
						yPositionOfRightClickEvent: $event.clientY
					}
				})
			)

			document.querySelector(".tree-element-0").addEventListener("scroll", this.scrollFunction)
		}
	}

	toggleOpen() {
		this.isOpen = !this.isOpen
	}

	private scrollFunction = () => {
		this.store.dispatch(setRightClickedNodeData({ value: null }))
		document.querySelector(".tree-element-0").removeEventListener("scroll", this.scrollFunction)
	}
}
