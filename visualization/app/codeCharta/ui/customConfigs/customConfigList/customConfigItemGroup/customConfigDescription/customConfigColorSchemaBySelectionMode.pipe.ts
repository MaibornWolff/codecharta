import { Pipe, PipeTransform } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"
import { CustomConfigMapSelectionMode } from "../../../../../model/customConfig/customConfig.api.model"

@Pipe({
    name: "customConfigColorSchemaBySelectionMode",
    standalone: true
})
export class CustomConfigColorSchemaBySelectionMode implements PipeTransform {
    transform(customConfig: CustomConfigItem): string[] {
        const { mapColors, mapSelectionMode } = customConfig
        return mapSelectionMode === CustomConfigMapSelectionMode.MULTIPLE
            ? [mapColors.positive, mapColors.neutral, mapColors.negative, mapColors.selected]
            : [mapColors.positiveDelta, mapColors.negativeDelta, mapColors.selected]
    }
}
