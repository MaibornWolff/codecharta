import { NgModule } from "@angular/core"
import { RemoveExtensionPipe } from "./removeExtension.pipe"
import { MetricDescriptorTitlePipe } from "./metricDescriptorTitle.pipe"
import { AttributeDescriptorTooltipPipe } from "./attributeDescriptorTooltip.pipe"

@NgModule({
	declarations: [RemoveExtensionPipe, MetricDescriptorTitlePipe, AttributeDescriptorTooltipPipe],
	exports: [RemoveExtensionPipe, MetricDescriptorTitlePipe, AttributeDescriptorTooltipPipe]
})
export class SimplePipesModule {}
