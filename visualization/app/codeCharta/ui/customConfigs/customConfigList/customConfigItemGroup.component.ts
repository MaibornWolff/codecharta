import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	// @Input() test: CustomConfigItemGroup
	@Input() test: string
}
