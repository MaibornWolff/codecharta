import { NgModule } from "@angular/core"
import { SuspiciousMetricsComponent } from "./suspiciousMetrics.component"
import { SuspiciousMetricsMenuComponent } from "./suspiciousMetricsMenu/suspiciousMetricsMenu.component"
import { SuspiciousMetricsListComponent } from "./suspiciousMetricsMenu/susoiciousMetricsList/suspiciousMetricsList.component"
import { UntrackedMetricsListComponent } from "./suspiciousMetricsMenu/untrackedMetricsList/untrackedMetricsList.component"
import { SuspiciousMetricsDialogComponent } from "./suspiciousMetricsMenu/suspiciousMetricsDialog/suspiciousMetricsDialog.component"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../../../material/material.module"
import { MatDialogModule } from "@angular/material/dialog"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { UnsuspiciousMetricsListComponent } from "./suspiciousMetricsMenu/unsuspiciousMetricsList/unsuspiciousMetricsList.component"

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
		SuspiciousMetricsMenuComponent,
		SuspiciousMetricsListComponent,
		UntrackedMetricsListComponent,
		SuspiciousMetricsDialogComponent,
		SuspiciousMetricsComponent,
		UnsuspiciousMetricsListComponent
	],
	exports: [SuspiciousMetricsComponent]
})
export class SuspiciousMetricsModule {}
