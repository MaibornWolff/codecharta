import "./ribbonBar.component.scss"
import $ from "jquery"

export class RibbonBarController {
	private collapsingElements = $("ribbon-bar-component .element-to-toggle")
	private toggleElements = $("ribbon-bar-component .element-to-toggle .section-title")
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

	public hoverToggle() {
		this.toggleElements.addClass("toggle-hovered")
	}

	public unhoverToggle() {
		this.toggleElements.removeClass("toggle-hovered")
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
