import { Component } from "@angular/core"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

@Component({
    selector: "cc-tool-bar",
    templateUrl: "./toolBar.component.html",
    styleUrls: ["./toolBar.component.scss"]
})
export class ToolBarComponent {
    hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)

    constructor(private store: Store<CcState>) {}
}
