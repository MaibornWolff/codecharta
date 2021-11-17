import { NgModule } from "@angular/core"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"

const materialComponents = [MatSelectModule, MatButtonModule]

@NgModule({
	imports: [BrowserAnimationsModule, materialComponents],
	exports: [materialComponents]
})
export class MaterialModule {}
