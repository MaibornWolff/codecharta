import "./hoveredNodePathPanel.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { hoveredNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"

@Component({
	selector: "cc-hovered-node-path-panel",
	template: require("./hoveredNodePathPanel.component.html")
})
export class HoveredNodePathPanelComponent {
	hoveredNodePathPanelData$ = this.store.select(hoveredNodePathPanelDataSelector)

	constructor(@Inject(Store) private store: Store) {}
}
