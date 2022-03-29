import { Component, Input } from "@angular/core"

@Component({
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	// @Input() test: CustomConfigItemGroup
	@Input() test: string
}
