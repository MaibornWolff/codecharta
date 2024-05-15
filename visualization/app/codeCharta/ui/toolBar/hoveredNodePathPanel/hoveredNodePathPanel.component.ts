import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"

@Component({
    selector: "cc-hovered-node-path-panel",
    templateUrl: "./hoveredNodePathPanel.component.html",
    styleUrls: ["./hoveredNodePathPanel.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class HoveredNodePathPanelComponent {
    hoveredNodePathPanelData$ = this.store.select(hoveredNodePathPanelDataSelector)

    constructor(private store: Store<CcState>) {}
}
