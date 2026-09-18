import { AsyncPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component } from "@angular/core"
import { loadPhase$ } from "../../../../util/busy/loadPhase"

/** The indicator for the stretch before the shell exists, and with it every view's own spinner. */
@Component({
    selector: "cc-boot-loading-indicator",
    templateUrl: "./bootLoadingIndicator.component.html",
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootLoadingIndicatorComponent {
    protected readonly loadPhaseStream = loadPhase$
}
