import { Component, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { debounce } from "../../../util/debounce"

@Component({
	templateUrl: "./customConfigList.component.html",
	styleUrls: ["./customConfigList.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigListComponent {
	searchTerm = ""
	isNonApplicableListCollapsed = true
	searchPlaceholder = "Search by name, mode and metrics..."
	setSearchTermDebounced = debounce((event: Event) => (this.searchTerm = event.target["value"]), 400)

	constructor(public customConfigService: CustomConfigHelperService) {}

	toggleNonApplicableCustomConfigsList() {
		this.isNonApplicableListCollapsed = !this.isNonApplicableListCollapsed
	}
}
