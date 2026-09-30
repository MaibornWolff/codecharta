import { ChangeDetectionStrategy, Component } from "@angular/core"

@Component({
    selector: "cc-bar-tools-divider",
    template: "",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "mx-0.5 h-3.5 w-px bg-base-300", "aria-hidden": "true" }
})
export class BarToolsDividerComponent {}
