import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { heightMetricSelector } from "../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { areaMetricSelector } from "../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { edgeMetricSelector } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { Component, ViewContainerRef, OnDestroy, OnInit } from "@angular/core"

@Component({
    selector: "cc-legend-panel",
    templateUrl: "./legendPanel.component.html",
    styleUrls: ["./legendPanel.component.scss"]
})
export class LegendPanelComponent implements OnInit, OnDestroy {
    isLegendVisible = false
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    heightMetric$ = this.store.select(heightMetricSelector)
    areaMetric$ = this.store.select(areaMetricSelector)
    colorMetric$ = this.store.select(colorMetricSelector)
    edgeMetric$ = this.store.select(edgeMetricSelector)

    private mouseDownListener?: (event: MouseEvent) => void

    constructor(
        private store: Store<CcState>,
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
        private readonly viewReference: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.mouseDownListener = (event: MouseEvent) => this.collapseOnOutsideClick(event)
        document.addEventListener("mousedown", this.mouseDownListener)
    }

    ngOnDestroy(): void {
        if (this.mouseDownListener) {
            document.removeEventListener("mousedown", this.mouseDownListener)
        }
    }

    toggleIsLegendVisible() {
        this.isLegendVisible = !this.isLegendVisible
    }

    private collapseOnOutsideClick(event: MouseEvent) {
        const target = event.target as Node
        if (this.isLegendVisible) {
            const clickedInside = this.viewReference.element.nativeElement.contains(target)
            const overlayPaneElement = document.querySelector(".cdk-overlay-container")
            const clickedWithinOverlayPane = overlayPaneElement ? overlayPaneElement.contains(target) : false

            if (!clickedInside && !clickedWithinOverlayPane) {
                this.isLegendVisible = false
            }
        }
    }
}
