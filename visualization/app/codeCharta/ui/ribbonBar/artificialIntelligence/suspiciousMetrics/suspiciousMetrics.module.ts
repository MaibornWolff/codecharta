import { NgModule } from "@angular/core"
import { SuspiciousMetricsComponent } from "./suspiciousMetrics.component"
import { SuspiciousMetricsButtonComponent } from "./suspiciousMetricsButton.component"
import { SuspiciousMetricsMenuComponent } from "./suspiciousMetricsMenu.component"
import { SuspiciousMetricsListComponent } from "./suspiciousMetricsList.component"
import { UntrackedMetricsListComponent } from "./untrackedMetricsList.component"
import { SuspiciousMetricsDialogComponent } from "./suspiciousMetricsDialog.component"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../../../material/material.module"
import { MatDialogModule } from "@angular/material/dialog"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		MatDialogModule,
		CommonModule,
		MatMenuModule,
		MatIconModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatDialogModule
	],
	declarations: [
		SuspiciousMetricsButtonComponent,
		SuspiciousMetricsMenuComponent,
		SuspiciousMetricsListComponent,
		UntrackedMetricsListComponent,
		SuspiciousMetricsDialogComponent,
		SuspiciousMetricsComponent
	],
	exports: [SuspiciousMetricsComponent]
})
export class SuspiciousMetricsModule {}
