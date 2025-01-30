import { Component, OnInit } from "@angular/core"
import { Store } from "@ngrx/store"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { ToolBarComponent } from "./ui/toolBar/toolBar.component"
import { FileExtensionBarComponent } from "./ui/fileExtensionBar/fileExtensionBar.component"
import { RibbonBarComponent } from "./ui/ribbonBar/ribbonBar.component"
import { CodeMapComponent } from "./ui/codeMap/codeMap.component"
import { LegendPanelComponent } from "./ui/legendPanel/legendPanel.component"
import { LoadingFileProgressSpinnerComponent } from "./ui/loadingFileProgressSpinner/loadingFileProgressSpinner.component"
import { LogoComponent } from "./ui/logo/logo.component"

@Component({
    selector: "cc-code-charta",
    templateUrl: "./codeCharta.component.html",
    standalone: true,
    imports: [
        ToolBarComponent,
        FileExtensionBarComponent,
        RibbonBarComponent,
        CodeMapComponent,
        LegendPanelComponent,
        LoadingFileProgressSpinnerComponent,
        LogoComponent
    ]
})
export class CodeChartaComponent implements OnInit {
    isInitialized = false

    constructor(
        private readonly store: Store,
        private readonly loadInitialFileService: LoadInitialFileService
    ) {}

    async ngOnInit(): Promise<void> {
        this.store.dispatch(setIsLoadingFile({ value: true }))
        await this.loadInitialFileService.loadFilesOrSampleFiles()
        this.isInitialized = true
    }
}
