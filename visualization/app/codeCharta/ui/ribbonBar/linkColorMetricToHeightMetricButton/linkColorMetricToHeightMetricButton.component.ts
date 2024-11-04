import { Component } from "@angular/core"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { NgClass, AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-link-color-metric-to-height-metric-button",
    templateUrl: "./linkColorMetricToHeightMetricButton.component.html",
    styleUrls: ["./linkColorMetricToHeightMetricButton.component.scss"],
    standalone: true,
    imports: [NgClass, AsyncPipe]
})
export class LinkColorMetricToHeightMetricButtonComponent {
    isColorMetricLinkedToHeightMetric$ = this.store.select(isColorMetricLinkedToHeightMetricSelector)

    constructor(private store: Store<CcState>) {}

    toggleIsColorMetricLinkedToHeightMetric() {
        this.store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
    }
}
