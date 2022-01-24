import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FlattenButtonsComponent } from "./flattenButtons.component"

@NgModule({
	imports: [CommonModule],
	declarations: [FlattenButtonsComponent],
	exports: [FlattenButtonsComponent]
})
export class FlattenButtonsModule {}
