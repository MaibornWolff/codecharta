import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"
import { AsyncPipe } from "@angular/common"
import { filter, map } from "rxjs"

@Component({
    selector: "cc-hovered-node-path-panel",
    templateUrl: "./hoveredNodePathPanel.component.html",
    styleUrls: ["./hoveredNodePathPanel.component.scss"],
    standalone: true,
    imports: [AsyncPipe]
})
export class HoveredNodePathPanelComponent {
    hoveredNodePathPanelData$ = this.store.select(hoveredNodePathPanelDataSelector).pipe(
        filter(it => !!it),
        map(items => {
            const paths = items.path.map(it => ({
                path: it
            }))

            return {
                isFile: items.isFile,
                paths: paths
            }
        })
    )

    constructor(private readonly store: Store<CcState>) {}
}
