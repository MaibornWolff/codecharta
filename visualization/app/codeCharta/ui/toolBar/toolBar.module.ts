import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { FilePanelModule } from "../filePanel/filePanel.module"
import { CopyToClipboardButtonModule } from "../copyToClipboardButton/copyToClipboardButton.module"

import { ToolBarComponent } from "./toolBar.component"
import { Export3DMapButtonModule } from "../export3DMapButton/export3DMapButton.module"

@NgModule({
    imports: [CommonModule, CopyToClipboardButtonModule, Export3DMapButtonModule, FilePanelModule, ToolBarComponent],
    exports: [ToolBarComponent]
})
export class ToolBarModule {}
