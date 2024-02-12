import { Pipe, PipeTransform } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"

@Pipe({ name: "filterCustomConfigDataBySearchTerm" })
export class FilterCustomConfigDataBySearchTermPipe implements PipeTransform {
	transform(customConfigItems: CustomConfigItem[], searchTerm: string) {
		const lowerCasedSearchTerm = searchTerm.toLocaleLowerCase().trimEnd()
		return customConfigItems.filter(customConfigItem => {
			const isSearchTermIncludedInName = customConfigItem.name.toLocaleLowerCase().includes(lowerCasedSearchTerm)
			const isSearchTermInlcudedInMode = customConfigItem.mapSelectionMode.toLocaleLowerCase().includes(lowerCasedSearchTerm)
			const isSearchTermIncludedInMetrics = Object.values(customConfigItem.metrics).some(metric =>
				metric?.toLocaleLowerCase().includes(lowerCasedSearchTerm)
			)
			return isSearchTermIncludedInName || isSearchTermInlcudedInMode || isSearchTermIncludedInMetrics
		})
	}
}
