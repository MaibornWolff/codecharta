import { Component, Input } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"

@Component({
	selector: "cc-custom-config-description",
	template: require("./customConfigDescription.component.html")
})
export class CustomConfigDescriptionComponent {
	@Input() customConfigItem: CustomConfigItem
}
