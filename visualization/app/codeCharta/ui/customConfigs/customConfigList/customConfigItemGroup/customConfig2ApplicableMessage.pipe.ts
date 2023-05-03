import { Pipe, PipeTransform } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { CustomConfigItem } from "../../customConfigs.component"
import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"

@Pipe({ name: "customConfig2ApplicableMessage" })
export class CustomConfig2ApplicableMessage implements PipeTransform {
	constructor(private state: State<CcState>) {}

	transform(customConfig: CustomConfigItem): string {
		const { mapSelectionMode, mapNames } = getMissingCustomConfigModeAndMaps(customConfig, this.state.getValue())

		if (mapNames.length > 0 && mapSelectionMode.length > 0) {
			return `This view is partially applicable. To complete your view, please switch to the ${mapSelectionMode} mode and select the following map(s): ${mapNames.join(
				", "
			)}.`
		}
		if (mapNames.length > 0) {
			return `To fulfill your view, please select the following map(s): ${mapNames.join(", ")}.`
		}
		if (mapSelectionMode.length > 0) {
			return `This view is partially applicable. To complete your view, please switch to the ${mapSelectionMode} mode.`
		}
		return `Apply Custom View`
	}
}
