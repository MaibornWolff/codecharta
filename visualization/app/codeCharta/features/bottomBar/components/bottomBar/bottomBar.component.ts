import { ChangeDetectionStrategy, Component } from "@angular/core"
import { AttributionComponent } from "../attribution/attribution.component"
import { HoveredPathComponent } from "../hoveredPath/hoveredPath.component"

@Component({
    selector: "cc-bottom-bar",
    templateUrl: "./bottomBar.component.html",
    imports: [HoveredPathComponent, AttributionComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomBarComponent {}
