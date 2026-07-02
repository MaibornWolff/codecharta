import { ChangeDetectionStrategy, Component } from "@angular/core"
import { LegendColorRowComponent } from "./legendColorRow.component"

@Component({
    selector: "cc-legend-color-scale-section",
    templateUrl: "./legendColorScaleSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendColorRowComponent]
})
export class LegendColorScaleSectionComponent {}
