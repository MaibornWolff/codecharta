import { NgModule } from "@angular/core"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select"
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu"
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button"
import { MatDividerModule } from "@angular/material/divider"
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog"
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card"
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field"
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input"
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner"
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list"
import { MatExpansionModule } from "@angular/material/expansion"
import { MatLegacySliderModule as MatSliderModule } from "@angular/material/legacy-slider"
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle"

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
	BrowserAnimationsModule
]

@NgModule({
	imports: [BrowserAnimationsModule, materialModules],
	exports: [materialModules]
})
export class MaterialModule {}
