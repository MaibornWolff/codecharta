import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core"
import { Store } from "@ngrx/store"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { NavBarComponent } from "./features/navBar/facade"
import { BottomBarComponent } from "./features/bottomBar/facade"
import { NodeContextMenuComponent } from "./features/nodeContextMenu/facade"
import { SidebarExplorerComponent } from "./features/sidebarExplorer/facade"
import { SidebarInspectorComponent } from "./features/sidebarInspector/facade"
import { FileExtensionBarComponent } from "./ui/fileExtensionBar/fileExtensionBar.component"
import { MetricsBarComponent } from "./features/metricsBar/facade"
import { CodeMapComponent } from "./ui/codeMap/codeMap.component"
import { LegendPanelComponent } from "./features/legend/facade"
import { LoadingFileProgressSpinnerComponent } from "./features/shared/components/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { ChangelogDialogComponent } from "./features/changelog/components/changelogDialog/changelogDialog.component"
import { ErrorDialogComponent } from "./features/shared/components/errorDialog/errorDialog.component"

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

    constructor(
        private readonly store: Store,
        private readonly loadInitialFileService: LoadInitialFileService
    ) {}

    ngOnInit(): void {
        this.store.dispatch(setIsLoadingFile({ value: true }))
        this.loadInitialFileService.loadFilesOrSampleFiles().then(() => {
            this.isInitialized.set(true)
        })
    }
}
