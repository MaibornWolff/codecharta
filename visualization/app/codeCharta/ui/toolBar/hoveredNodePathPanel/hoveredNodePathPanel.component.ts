import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { hoveredNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"

@Component({
	selector: "cc-hovered-node-path-panel",
	templateUrl: "./hoveredNodePathPanel.component.html",
	styleUrls: ["./hoveredNodePathPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class HoveredNodePathPanelComponent {
	hoveredNodePathPanelData$ = this.store.select(hoveredNodePathPanelDataSelector)

	constructor(@Inject(Store) private store: Store) {}
}
