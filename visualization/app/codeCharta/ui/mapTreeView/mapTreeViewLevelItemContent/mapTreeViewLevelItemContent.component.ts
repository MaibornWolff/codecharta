import { Component, Inject, Input, OnInit } from "@angular/core"
import { Observable } from "rxjs"
import { CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { totalUnarySelector } from "../../../state/selectors/totalUnary.selector"
import { hoveredBuildingPathSelector } from "../../../state/store/lookUp/hoveredBuildingPath/hoveredBuildingPath.selector"
import { NodeContextMenuController } from "../../nodeContextMenu/nodeContextMenu.component"

@Component({
	selector: "cc-map-tree-view-level-item-content",
	template: require("./mapTreeViewLevelItemContent.component.html")
})
export class MapTreeViewLevelItemContent implements OnInit {
	@Input() node: CodeMapNode
	hoveredBuildingId$: Observable<string | null>
	totalUnary$

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit() {
		this.hoveredBuildingId$ = this.store.select(hoveredBuildingPathSelector)
		this.totalUnary$ = this.store.select(totalUnarySelector)
	}

	openNodeContextMenu($event) {
		$event.stopPropagation()
		NodeContextMenuController.broadcastShowEvent2(this.node.path, this.node.type, $event.clientX, $event.clientY)
		// this._viewModel.isMarked = true
		document.getElementById("tree-root").addEventListener("scroll", this.hideContextMenuOnceOnScroll)
	}

	private hideContextMenuOnceOnScroll = () => {
		NodeContextMenuController.broadcastHideEvent2()
		document.getElementById("tree-root").removeEventListener("scroll", this.hideContextMenuOnceOnScroll)
	}
}
