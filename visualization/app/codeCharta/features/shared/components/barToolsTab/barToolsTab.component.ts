import { ChangeDetectionStrategy, Component } from "@angular/core"

@Component({
    selector: "cc-bar-tools-tab",
    template: "<ng-content></ng-content>",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "absolute bottom-full right-4 flex h-7 items-center gap-0.5 rounded-t-md border border-b-0 border-base-300 bg-base-100 px-1",
        role: "toolbar",
        "aria-label": "View tools"
    }
})
export class BarToolsTabComponent {}
