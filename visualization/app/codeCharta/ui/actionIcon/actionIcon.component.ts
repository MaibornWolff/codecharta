import { ChangeDetectionStrategy, Component, Input } from "@angular/core"

@Component({
    selector: "cc-action-icon",
    templateUrl: "./actionIcon.component.html",
    styleUrls: ["./actionIcon.component.scss"],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionIconComponent {
    @Input() icon: string
}
