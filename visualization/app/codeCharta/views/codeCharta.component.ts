import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core"
import { BottomBarComponent } from "../features/bottomBar/facade"
import { ChangelogDialogComponent } from "../features/changelog/components/changelogDialog/changelogDialog.component"
import { CodeMapComponent } from "../features/codeMap/facade"
import { FileExtensionBarComponent } from "../features/fileExtensionBar/facade"
import { LegendPanelComponent } from "../features/legend/facade"
import { MetricsBarComponent } from "../features/metricsBar/facade"
import { NavBarComponent } from "../features/navBar/facade"
import { NodeContextMenuComponent } from "../features/nodeContextMenu/facade"
import { ErrorDialogComponent } from "../features/shared/components/errorDialog/errorDialog.component"
import { LoadingFileProgressSpinnerComponent } from "../features/shared/components/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { SidebarExplorerComponent } from "../features/sidebarExplorer/facade"
import { SidebarInspectorComponent } from "../features/sidebarInspector/facade"
import { LoadFilesUseCase } from "../load/load.facade"

@Component({
    selector: "cc-code-charta",
    templateUrl: "./codeCharta.component.html",
    imports: [
        NavBarComponent,
        FileExtensionBarComponent,
        MetricsBarComponent,
        NodeContextMenuComponent,
        SidebarExplorerComponent,
        SidebarInspectorComponent,
        CodeMapComponent,
        LegendPanelComponent,
        LoadingFileProgressSpinnerComponent,
        ChangelogDialogComponent,
        ErrorDialogComponent,
        BottomBarComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeChartaComponent implements OnInit {
    isInitialized = signal(false)

    constructor(private readonly loadFilesUseCase: LoadFilesUseCase) {}

    ngOnInit(): void {
        // The use-case owns the loading indicator. A rejection must never leave the app uninitialized.
        this.loadFilesUseCase
            .loadOnBoot()
            .catch(() => undefined)
            .finally(() => {
                this.isInitialized.set(true)
            })
    }
}
