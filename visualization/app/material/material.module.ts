import { NgModule } from "@angular/core"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { MatSelectModule } from "@angular/material/select"
import { MatMenuModule } from "@angular/material/menu"
import { MatButtonModule } from "@angular/material/button"
import { MatDividerModule } from "@angular/material/divider"

const materialModules = [MatSelectModule, MatMenuModule, MatButtonModule, MatDividerModule]

@NgModule({
	imports: [BrowserAnimationsModule, materialModules],
	exports: [materialModules]
})
export class MaterialModule {}
