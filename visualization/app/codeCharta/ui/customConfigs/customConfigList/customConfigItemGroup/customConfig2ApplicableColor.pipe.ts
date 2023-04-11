import { Pipe, PipeTransform } from "@angular/core"
import { State as StateService } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"

@Pipe({ name: "customConfig2ApplicableColor" })
export class CustomConfig2ApplicableColor implements PipeTransform {
	constructor(private state: StateService<CcState>) {}

	transform(customConfig: CustomConfigItem): string {
		const { mapSelectionMode, mapNames } = getMissingCustomConfigModeAndMaps(customConfig, this.state)
		return mapNames.length > 0 || mapSelectionMode.length > 0 ? "rgb(204, 204, 204)" : "rgba(0, 0, 0, 0.87)"
	}
}
