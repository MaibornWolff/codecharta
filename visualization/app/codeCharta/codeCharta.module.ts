import { CodeChartaComponent } from "./codeCharta.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CodeMapModule } from "./ui/codeMap/codeMap.module"
import { LegendPanelModule } from "./ui/legendPanel/legendPanel.module"
import { RibbonBarModule } from "./ui/ribbonBar/ribbonBar.module"
import { ToolBarModule } from "./ui/toolBar/toolBar.module"
import { FileExtensionBarModule } from "./ui/fileExtensionBar/fileExtensionBar.module"
import { LoadingFileProgressSpinnerModule } from "./ui/loadingFileProgressSpinner/loadingFileProgressSpinner.module"

@NgModule({
	imports: [
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
