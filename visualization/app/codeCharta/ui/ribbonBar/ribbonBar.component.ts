import "./ribbonBar.component.scss"
import $ from "jquery"

export class RibbonBarController {
	private collapsingElements = $("ribbon-bar-component .element-to-toggle")
	private isExpanded: boolean = false

	public toggle() {
		if (this.isExpanded) {
			this.collapse()
		} else {
			this.expand()
		}
	}

	public expand() {
		this.isExpanded = true
		this.collapsingElements.addClass("expanded")
	}

	public collapse() {
		this.isExpanded = false
		this.collapsingElements.removeClass("expanded")
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
