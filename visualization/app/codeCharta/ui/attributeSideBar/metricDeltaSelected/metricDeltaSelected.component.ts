import { Component, Input, OnInit } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { CcState, CodeMapNode, MapColors } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { AsyncPipe, DecimalPipe } from "@angular/common"

@Component({
    selector: "cc-metric-delta-selected",
    templateUrl: "./metricDeltaSelected.component.html",
    styleUrls: ["./metricDeltaSelected.component.scss"],
    standalone: true,
    imports: [AsyncPipe, DecimalPipe]
})
export class MetricDeltaSelectedComponent implements OnInit {
    @Input() metricName: string

    selectedNode$: Observable<CodeMapNode>
    mapColors$: Observable<MapColors>

    constructor(private readonly store: Store<CcState>) {}

    ngOnInit(): void {
        this.selectedNode$ = this.store.select(selectedNodeSelector)
        this.mapColors$ = this.store.select(mapColorsSelector)
    }
}
