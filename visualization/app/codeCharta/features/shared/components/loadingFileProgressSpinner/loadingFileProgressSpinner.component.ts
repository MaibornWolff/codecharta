import { AsyncPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { map } from "rxjs"
import { ViewId } from "../../../../routing/routePaths"
import { LoadingFileProgressSpinnerService } from "../../services/loadingFileProgressSpinner.service"

@Component({
    selector: "cc-loading-file-progress-spinner",
    templateUrl: "./loadingFileProgressSpinner.component.html",
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingFileProgressSpinnerComponent {
    private readonly loadingFileProgressSpinnerService = inject(LoadingFileProgressSpinnerService)

    readonly view = input.required<ViewId>()

    /**
     * The fade is delayed so that a change taking only a moment does not make the view blink. A spinner
     * that is mounted into a load already under way has no such moment to hide: it takes over from the
     * boot indicator, and fading in would show the half-built application first. So only a load that
     * starts while the spinner is already on screen fades in.
     */
    protected readonly loadingStateStream = computed(() =>
        this.loadingFileProgressSpinnerService
            .isLoading$(this.view())
            .pipe(map((isLoading, index) => ({ isLoading, fadesIn: isLoading && index > 0 })))
    )

    protected readonly loadPhaseStream = computed(() => this.loadingFileProgressSpinnerService.phase$(this.view()))
}
