import { NgModule } from "@angular/core"
import { RemoveExtensionPipe } from "./removeExtension.pipe"
import { MetricDescriptorTitlePipe } from "./metricDescriptorTitle.pipe"

@NgModule({
	declarations: [RemoveExtensionPipe, MetricDescriptorTitlePipe],
	exports: [RemoveExtensionPipe, MetricDescriptorTitlePipe]
})
export class SimplePipesModule {}
