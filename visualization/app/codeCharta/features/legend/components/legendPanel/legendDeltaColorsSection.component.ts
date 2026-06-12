import { ChangeDetectionStrategy, Component } from "@angular/core"
import { LegendColorRowComponent } from "./legendColorRow.component"

@Component({
    selector: "cc-legend-delta-colors-section",
    templateUrl: "./legendDeltaColorsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendColorRowComponent]
})
export class LegendDeltaColorsSectionComponent {}
