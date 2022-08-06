import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { RibbonBarButtonComponent } from "./ribbonBarButton.component"

@NgModule({
	imports: [CommonModule],
	declarations: [RibbonBarButtonComponent],
	exports: [RibbonBarButtonComponent]
})
export class RibbonBarButtonModule {}
