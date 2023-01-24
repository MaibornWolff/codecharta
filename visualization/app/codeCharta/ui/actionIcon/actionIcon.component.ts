import { Component, Input, ViewEncapsulation } from "@angular/core"

@Component({
	selector: "cc-action-icon",
	templateUrl: "./actionIcon.component.html",
	styleUrls: ["./actionIcon.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ActionIconComponent {
	@Input() icon: string
}
