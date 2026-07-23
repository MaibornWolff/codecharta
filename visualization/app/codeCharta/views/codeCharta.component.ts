import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { ChangelogDialogComponent } from "../features/changelog/facade"
import { NavBarComponent } from "../features/navBar/facade"
import { ErrorDialogComponent, ToastComponent } from "../features/shared/facade"
import { LoadFilesUseCase } from "../load/load.facade"

@Component({
    selector: "cc-code-charta",
    templateUrl: "./codeCharta.component.html",
    imports: [NavBarComponent, ChangelogDialogComponent, ErrorDialogComponent, ToastComponent, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeChartaComponent implements OnInit {
    isInitialized = signal(false)

    constructor(private readonly loadFilesUseCase: LoadFilesUseCase) {}

    ngOnInit(): void {
        this.loadFilesUseCase
            .loadOnBoot()
            .catch(() => undefined)
            .finally(() => {
                this.isInitialized.set(true)
            })
    }
}
