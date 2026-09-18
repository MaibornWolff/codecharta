import { AsyncPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component } from "@angular/core"
import { loadPhase$ } from "../../../../util/busy/loadPhase"

/**
 * The indicator for the stretch before the application exists: the shell, and with it every view's own
 * spinner, is only rendered once the boot load has finished, and on a large project that load takes
 * tens of seconds. It reads the phase the load publishes, so the wait is named rather than blank.
 */
@Component({
    selector: "cc-boot-loading-indicator",
    templateUrl: "./bootLoadingIndicator.component.html",
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootLoadingIndicatorComponent {
    protected readonly loadPhaseStream = loadPhase$
}
