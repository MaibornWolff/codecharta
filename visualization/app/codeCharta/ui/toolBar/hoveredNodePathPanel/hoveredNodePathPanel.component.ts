import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-hovered-node-path-panel",
    templateUrl: "./hoveredNodePathPanel.component.html",
    styleUrls: ["./hoveredNodePathPanel.component.scss"],
    standalone: true,
    imports: [AsyncPipe]
})
export class HoveredNodePathPanelComponent {
    hoveredNodePathPanelData$ = this.store.select(hoveredNodePathPanelDataSelector)

    constructor(private readonly store: Store<CcState>) {}
}
