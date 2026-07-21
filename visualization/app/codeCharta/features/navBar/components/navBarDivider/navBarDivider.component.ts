import { ChangeDetectionStrategy, Component } from "@angular/core"

/** The thin vertical hairline that separates nav-bar controls. */
@Component({
    selector: "cc-nav-divider",
    template: "",
    host: { class: "w-px h-4 bg-base-300 self-center mx-1" },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarDividerComponent {}
