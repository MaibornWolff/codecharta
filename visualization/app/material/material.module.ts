import { FormsModule } from "@angular/forms"
import { NgModule } from "@angular/core"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { MatSelectModule } from "@angular/material/select"
import { MatMenuModule } from "@angular/material/menu"
import { MatButtonModule } from "@angular/material/button"
import { MatDividerModule } from "@angular/material/divider"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { MatDialogModule } from "@angular/material/dialog"
import { MatCardModule } from "@angular/material/card"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatListModule } from "@angular/material/list"
import { MatExpansionModule } from "@angular/material/expansion"
import { MatSliderModule } from "@angular/material/slider"
import { MatSlideToggleModule } from "@angular/material/slide-toggle"

const materialModules = [
	MatSelectModule,
	MatMenuModule,
	MatButtonModule,
	MatDividerModule,
	MatTooltipModule,
	MatDialogModule,
	MatCardModule,
	MatButtonToggleModule,
	MatDialogModule,
	MatCheckboxModule,
	MatToolbarModule,
	MatFormFieldModule,
	MatInputModule,
	MatProgressSpinnerModule,
	MatListModule,
	MatExpansionModule,
	MatSliderModule,
	MatSlideToggleModule,
	BrowserAnimationsModule,
	FormsModule
]

@NgModule({
	imports: [BrowserAnimationsModule, materialModules],
	exports: [materialModules]
})
export class MaterialModule {}
