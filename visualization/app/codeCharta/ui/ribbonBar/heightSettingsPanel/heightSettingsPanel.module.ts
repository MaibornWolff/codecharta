import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { SliderModule } from "../../slider/slider.module"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel.component"

@NgModule({
    imports: [CommonModule, MaterialModule, SliderModule, ResetSettingsButtonModule],
    declarations: [HeightSettingsPanelComponent],
    exports: [HeightSettingsPanelComponent]
})
export class HeightSettingsPanelModule {}
