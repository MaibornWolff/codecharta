import "./ribbonBar.component.scss"
import $ from "jquery"

export class RibbonBarController {
	private readonly EXPANDED_CLASS = "expanded"

	public toggle(event) {
		const boxElement = $(event.srcElement).closest("md-card")

		if (boxElement.hasClass(this.EXPANDED_CLASS)) {
			boxElement.removeClass(this.EXPANDED_CLASS)
		} else {
			boxElement.addClass(this.EXPANDED_CLASS)
		}
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
