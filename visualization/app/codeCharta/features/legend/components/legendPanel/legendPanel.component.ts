import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { injectIsRadialLayout } from "../../../shared/facade"
import { InspectorVisibilityService } from "../../../sidebarInspector/facade"
import { LegendDrawerComponent } from "../legendDrawer/legendDrawer.component"
import { LegendColorRowComponent } from "./legendColorRow.component"
import { LegendColorScaleSectionComponent } from "./legendColorScaleSection.component"
import { LegendDeltaColorsSectionComponent } from "./legendDeltaColorsSection.component"
import { LegendEdgeColorsSectionComponent } from "./legendEdgeColorsSection.component"
import { LegendFoldersRowComponent } from "./legendFoldersRow.component"
import { LegendMetricsSectionComponent } from "./legendMetricsSection.component"

@Component({
    selector: "cc-legend-panel",
    templateUrl: "./legendPanel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LegendDrawerComponent,
        LegendMetricsSectionComponent,
        LegendColorScaleSectionComponent,
        LegendDeltaColorsSectionComponent,
        LegendEdgeColorsSectionComponent,
        LegendColorRowComponent,
        LegendFoldersRowComponent
    ]
})
export class LegendPanelComponent {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)

    readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })
    readonly isRadialLayout = injectIsRadialLayout()
    readonly isInspectorVisible = inject(InspectorVisibilityService).isVisible
}
