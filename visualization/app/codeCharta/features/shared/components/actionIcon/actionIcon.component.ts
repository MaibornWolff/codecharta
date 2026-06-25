import { ChangeDetectionStrategy, Component, Input } from "@angular/core"

@Component({
    selector: "cc-action-icon",
    templateUrl: "./actionIcon.component.html",
    standalone: true,
    host: {
        class: "inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-sm text-white hover:bg-secondary"
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionIconComponent {
    @Input() icon: string
}
