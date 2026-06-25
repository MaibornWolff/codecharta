import { ChangeDetectionStrategy, Component } from "@angular/core"
import { AsyncPipe } from "@angular/common"
import { Observable } from "rxjs"
import { LoadingFileProgressSpinnerService } from "../../services/loadingFileProgressSpinner.service"

@Component({
    selector: "cc-loading-file-progress-spinner",
    templateUrl: "./loadingFileProgressSpinner.component.html",
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingFileProgressSpinnerComponent {
    isLoading$: Observable<boolean>

    constructor(loadingFileProgressSpinnerService: LoadingFileProgressSpinnerService) {
        this.isLoading$ = loadingFileProgressSpinnerService.isLoading$()
    }
}
