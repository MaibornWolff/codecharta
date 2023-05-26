import { NgModule } from "@angular/core"
import { RemoveExtensionPipe } from "./removeExtension.pipe"
import { AttributeDescriptorTooltipPipe } from "./attributeDescriptorTooltip.pipe"
import { TruncateTextPipe } from "./truncateText.pipe"

@NgModule({
	declarations: [RemoveExtensionPipe, AttributeDescriptorTooltipPipe, TruncateTextPipe],
	exports: [RemoveExtensionPipe, AttributeDescriptorTooltipPipe, TruncateTextPipe]
})
export class SimplePipesModule {}
