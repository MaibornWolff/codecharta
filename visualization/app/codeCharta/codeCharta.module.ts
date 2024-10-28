import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { CodeChartaComponent } from "./codeCharta.component"

import { FileExtensionBarModule } from "./ui/fileExtensionBar/fileExtensionBar.module"

import { RibbonBarModule } from "./ui/ribbonBar/ribbonBar.module"
import { ToolBarModule } from "./ui/toolBar/toolBar.module"

@NgModule({
    imports: [CommonModule, RibbonBarModule, ToolBarModule, FileExtensionBarModule, CodeChartaComponent],
    exports: [CodeChartaComponent]
})
export class CodeChartaModule {}
