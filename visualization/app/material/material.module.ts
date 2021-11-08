import { NgModule } from "@angular/core"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { MatSelectModule } from "@angular/material/select"

const materialComponents = [MatSelectModule]

@NgModule({
	imports: [BrowserAnimationsModule, materialComponents],
	exports: [materialComponents]
})
export class MaterialModule {}
