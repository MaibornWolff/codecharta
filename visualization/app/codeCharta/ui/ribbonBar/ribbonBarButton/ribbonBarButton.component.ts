import "./ribbonBarButton.component.scss"
import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-ribbon-bar-button",
	template: require("./ribbonBarButton.component.html")
})
export class RibbonBarButtonComponent {
	@Input() title: string
	@Input() iconClass: string
	@Input() handleClick: () => void
}
