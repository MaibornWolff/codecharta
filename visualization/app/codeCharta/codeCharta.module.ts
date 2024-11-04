import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { CodeChartaComponent } from "./codeCharta.component"
import { CodeMapModule } from "./ui/codeMap/codeMap.module"
import { FileExtensionBarModule } from "./ui/fileExtensionBar/fileExtensionBar.module"
import { LegendPanelModule } from "./ui/legendPanel/legendPanel.module"
import { LoadingFileProgressSpinnerModule } from "./ui/loadingFileProgressSpinner/loadingFileProgressSpinner.module"
import { LogoModule } from "./ui/logo/logo.module"
import { RibbonBarModule } from "./ui/ribbonBar/ribbonBar.module"
import { ToolBarModule } from "./ui/toolBar/toolBar.module"

@NgModule({
    imports: [
        LogoModule,
        CommonModule,
        CodeMapModule,
        LegendPanelModule,
        RibbonBarModule,
        ToolBarModule,
        FileExtensionBarModule,
        LoadingFileProgressSpinnerModule
    ],
    declarations: [CodeChartaComponent],
    exports: [CodeChartaComponent]
})
export class CodeChartaModule {}
