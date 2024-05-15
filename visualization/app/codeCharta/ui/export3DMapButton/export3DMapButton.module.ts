import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { ActionIconModule } from "../actionIcon/actionIcon.module"

@NgModule({
    imports: [CommonModule, ActionIconModule],
    declarations: [Export3DMapButtonComponent],
    exports: [Export3DMapButtonComponent]
})
export class Export3DMapButtonModule {}
