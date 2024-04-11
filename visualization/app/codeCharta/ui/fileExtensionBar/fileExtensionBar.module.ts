import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { DistributionMetricChooserModule } from "./distributionMetricChooser/distributionMetricChooser.module"
import { FileExtensionBarComponent } from "./fileExtensionBar.component"

@NgModule({
	imports: [CommonModule, DistributionMetricChooserModule],
	declarations: [FileExtensionBarComponent],
	exports: [FileExtensionBarComponent]
})
export class FileExtensionBarModule {}
