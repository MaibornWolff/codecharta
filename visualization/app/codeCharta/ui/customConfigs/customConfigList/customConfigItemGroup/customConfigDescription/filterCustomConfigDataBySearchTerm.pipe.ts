import { Pipe, PipeTransform } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"

@Pipe({
	name: "filterCustomConfigDataBySearchTerm"
})
export class FilterCustomConfigDataBySearchTermPipe implements PipeTransform {
	transform(customConfigItems: CustomConfigItem[], searchTerm: string): CustomConfigItem[] {
		const lowerCasedSearchTerm = searchTerm.toLocaleLowerCase().trimEnd()
		return customConfigItems.filter(item => this.isItemMatchingSearchTerm(item, lowerCasedSearchTerm))
	}

	private isItemMatchingSearchTerm(customConfigItem: CustomConfigItem, searchTerm: string): boolean {
		const isSearchTermIncludedInName = customConfigItem.name.toLocaleLowerCase().includes(searchTerm)
		const isSearchTermIncludedInMode = customConfigItem.mapSelectionMode.toLocaleLowerCase().includes(searchTerm)
		const isSearchTermIncludedInMetrics = Object.values(customConfigItem.metrics).some(metric =>
			metric?.toLocaleLowerCase().includes(searchTerm)
		)

		return isSearchTermIncludedInName || isSearchTermIncludedInMode || isSearchTermIncludedInMetrics
	}
}
