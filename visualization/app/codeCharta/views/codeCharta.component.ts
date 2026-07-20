import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { ChangelogDialogComponent } from "../features/changelog/facade"
import { NavBarComponent } from "../features/navBar/facade"
import { ErrorDialogComponent } from "../features/shared/facade"
import { LoadFilesUseCase } from "../load/load.facade"

/**
 * The application shell. It owns the one-time boot (loadOnBoot), the global dialogs, the nav bar and the
 * `<router-outlet>` the metrics/domain views render into. Each routed view owns its own busy overlay. The router owns only the
 * path; the URL query string stays owned by QueryParamsService (see its doc comment).
 */
@Component({
    selector: "cc-code-charta",
    templateUrl: "./codeCharta.component.html",
    imports: [NavBarComponent, ChangelogDialogComponent, ErrorDialogComponent, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeChartaComponent implements OnInit {
    isInitialized = signal(false)

    constructor(private readonly loadFilesUseCase: LoadFilesUseCase) {}

    ngOnInit(): void {
        // The use-case owns the loading indicator. A rejection must never leave the app uninitialized.
        this.loadFilesUseCase
            .loadOnBoot()
            .catch(() => undefined)
            .finally(() => {
                this.isInitialized.set(true)
            })
    }
}
