import { Component, OnInit, signal } from "@angular/core"
import { Store } from "@ngrx/store"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { NavBarComponent } from "./features/navBar/facade"
import { BottomBarComponent } from "./features/bottomBar/facade"
import { SidebarExplorerComponent } from "./features/sidebarExplorer/facade"
import { FileExtensionBarComponent } from "./ui/fileExtensionBar/fileExtensionBar.component"
import { RibbonBarComponent } from "./ui/ribbonBar/ribbonBar.component"
import { CodeMapComponent } from "./ui/codeMap/codeMap.component"
import { LegendPanelComponent } from "./ui/legendPanel/legendPanel.component"
import { LoadingFileProgressSpinnerComponent } from "./ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { ChangelogDialogComponent } from "./features/changelog/components/changelogDialog/changelogDialog.component"
import { ErrorDialogComponent } from "./ui/dialogs/errorDialog/errorDialog.component"

@Component({
    selector: "cc-code-charta",
    templateUrl: "./codeCharta.component.html",
    imports: [
        NavBarComponent,
        FileExtensionBarComponent,
        RibbonBarComponent,
        SidebarExplorerComponent,
        CodeMapComponent,
        LegendPanelComponent,
        LoadingFileProgressSpinnerComponent,
        ChangelogDialogComponent,
        ErrorDialogComponent,
        BottomBarComponent
    ]
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
