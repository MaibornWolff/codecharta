import { ResetSettingsButtonComponent } from "./resetSettingsButton.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [ResetSettingsButtonComponent],
	exports: [ResetSettingsButtonComponent]
})
export class ResetSettingsButtonModule {}
