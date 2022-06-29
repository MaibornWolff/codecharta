import "./actionIcon.component.scss"
import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-action-icon",
	template: require("./actionIcon.component.html")
})
export class ActionIconComponent {
	@Input() icon: string
}
