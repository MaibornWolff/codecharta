import { Component, Input } from "@angular/core"

@Component({
    selector: "cc-action-icon",
    templateUrl: "./actionIcon.component.html",
    styleUrls: ["./actionIcon.component.scss"],
    standalone: true
})
export class ActionIconComponent {
    @Input() icon: string
}
