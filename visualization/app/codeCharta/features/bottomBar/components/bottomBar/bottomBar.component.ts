import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/components/publishesHeight/publishesHeight.directive"
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
    /** Forwarded to the path breadcrumb — see HoveredPathComponent.showSelectedWhenNotHovered. */
    readonly showSelectedWhenNotHovered = input(false)

    /** Forwarded to the path breadcrumb — see HoveredPathComponent.selectedNodePath (view-owned selection). */
    readonly selectedNodePath = input<string | null | undefined>(undefined)
}
