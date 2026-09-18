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

    /** Only a load starting while the spinner is on screen fades in: one mounted into a load already
     * under way would show the half-built application through the delay. */
    protected readonly loadingStateStream = computed(() =>
        this.loadingFileProgressSpinnerService
            .isLoading$(this.view())
            .pipe(map((isLoading, index) => ({ isLoading, fadesIn: isLoading && index > 0 })))
    )

    protected readonly loadPhaseStream = computed(() => this.loadingFileProgressSpinnerService.phase$(this.view()))
}
