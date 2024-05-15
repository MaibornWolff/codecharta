import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ColorPickerModule } from "../../../../ui/colorPicker/colorPicker.module"
import { MarkFolderRowComponent } from "./markFolderRow.component"

@NgModule({
    imports: [CommonModule, ColorPickerModule],
    declarations: [MarkFolderRowComponent],
    exports: [MarkFolderRowComponent]
})
export class MarkFolderRowModule {}
