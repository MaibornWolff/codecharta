import { AsyncPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
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

    protected readonly isLoadingStream = computed(() => this.loadingFileProgressSpinnerService.isLoading$(this.view()))
}
