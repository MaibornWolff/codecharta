import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { GlobalConfigurationButtonComponent } from "./globalConfigurationButton.component"

@NgModule({
	imports: [MaterialModule],
	declarations: [GlobalConfigurationButtonComponent],
	exports: [GlobalConfigurationButtonComponent],
	entryComponents: [GlobalConfigurationButtonComponent]
})
export class GlobalConfigurationButtonModule {}
