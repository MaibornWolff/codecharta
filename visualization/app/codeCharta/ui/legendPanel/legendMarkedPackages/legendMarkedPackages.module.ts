import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { LabelledColorPickerModule } from "../../labelledColorPicker/labelledColorPicker.module"
import { LegendMarkedPackagesComponent } from "./legendMarkedPackages.component"

@NgModule({
    imports: [CommonModule, LabelledColorPickerModule],
    declarations: [LegendMarkedPackagesComponent],
    exports: [LegendMarkedPackagesComponent]
})
export class LegendMarkedPackagesModule {}
