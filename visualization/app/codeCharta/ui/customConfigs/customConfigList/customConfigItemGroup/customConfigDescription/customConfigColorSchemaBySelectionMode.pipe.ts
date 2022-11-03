import { Pipe, PipeTransform } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"
import { CustomConfigMapSelectionMode } from "../../../../../model/customConfig/customConfig.api.model"

@Pipe({ name: "customConfigColorSchemaBySelectionMode" })
export class CustomConfigColorSchemaBySelectionModePipe implements PipeTransform {
	transform(customConfig: CustomConfigItem): string[] {
		const { mapColors, mapSelectionMode } = customConfig
		return mapSelectionMode === CustomConfigMapSelectionMode.MULTIPLE
			? [mapColors.positive, mapColors.neutral, mapColors.negative]
			: [mapColors.positiveDelta, mapColors.negativeDelta]
	}
}
