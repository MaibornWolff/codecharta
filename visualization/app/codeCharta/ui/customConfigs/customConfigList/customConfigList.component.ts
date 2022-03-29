import { Component, Input } from "@angular/core"
import { CustomConfigItemGroup } from "../customConfigs.component"

@Component({
	template: require("./customConfigList.component.html")
})
export class CustomConfigListComponent {
	@Input() dropDownCustomConfigItemGroups: CustomConfigItemGroup[]
	//dropDownCustomConfigItemGroups = [1, 2, 3, 4, 5, 6]
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor() {}
}
