import { AsyncPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { ViewId } from "../../../../routing/routePaths"
import { LoadingFileProgressSpinnerService } from "../../services/loadingFileProgressSpinner.service"

/**
 * The busy overlay for ONE routed view. Each view renders its own, so the spinner only ever covers the
 * content that is actually still catching up — working in the domain view is never blocked by the 3D
 * map's rebuild, and switching to the map shows its spinner for exactly as long as that rebuild takes.
 *
 * It deliberately starts below the bars: the nav bar and the view switcher stay usable while a view is
 * busy, so the user can always leave a view that is taking its time.
 */
@Component({
    selector: "cc-loading-file-progress-spinner",
    templateUrl: "./loadingFileProgressSpinner.component.html",
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingFileProgressSpinnerComponent {
    private readonly loadingFileProgressSpinnerService = inject(LoadingFileProgressSpinnerService)

    readonly view = input.required<ViewId>()

    protected readonly isLoadingStream = computed(() => this.loadingFileProgressSpinnerService.isLoading$(this.view()))
}
