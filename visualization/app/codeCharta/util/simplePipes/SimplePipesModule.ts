import { NgModule } from "@angular/core"
import { RemoveExtensionPipe } from "./removeExtension.pipe"
import { AttributeDescriptorTooltipPipe } from "./attributeDescriptorTooltip.pipe"

@NgModule({
	declarations: [RemoveExtensionPipe, AttributeDescriptorTooltipPipe],
	exports: [RemoveExtensionPipe, AttributeDescriptorTooltipPipe]
})
export class SimplePipesModule {}
