import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { EXPLORER_FOCUS } from "../../explorerFocus.port"

@Component({
    selector: "cc-explorer-focus-banner",
    templateUrl: "./explorerFocusBanner.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block" }
})
export class ExplorerFocusBannerComponent {
    private readonly focus = inject(EXPLORER_FOCUS, { optional: true })

    readonly isFocused = this.focus?.isFocused

    unfocus(): void {
        this.focus?.unfocus()
    }
}
