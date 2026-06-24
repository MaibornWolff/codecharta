import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { ThreeMapControlsService } from "../../../../features/codeMap/facade"

@Component({
    selector: "cc-toolbox-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CenterMapButtonComponent {
    protected readonly mapControls = inject(ThreeMapControlsService)
}
