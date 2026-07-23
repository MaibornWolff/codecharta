import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/facade"
import { AttributionComponent } from "../attribution/attribution.component"
import { HoveredPathComponent } from "../hoveredPath/hoveredPath.component"

@Component({
    selector: "cc-bottom-bar",
    templateUrl: "./bottomBar.component.html",
    imports: [HoveredPathComponent, AttributionComponent, PublishesHeightDirective],
    providers: [{ provide: HEIGHT_CSS_VARIABLE, useValue: "--cc-bottom-bar-height" }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomBarComponent {
    readonly showSelectedWhenNotHovered = input(false)

    readonly selectedNodePath = input<string | null | undefined>(undefined)
}
