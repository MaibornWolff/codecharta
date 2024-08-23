import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { LinkColorMetricToHeightMetricButtonComponent } from "./linkColorMetricToHeightMetricButton.component"
import { RibbonBarMenuButtonModule } from "../ribbonBarMenuButton/ribbonBarMenuButton.module"

@NgModule({
    imports: [CommonModule, RibbonBarMenuButtonModule],
    declarations: [LinkColorMetricToHeightMetricButtonComponent],
    exports: [LinkColorMetricToHeightMetricButtonComponent]
})
export class LinkColorMetricToHeightMetricButtonModule {}
