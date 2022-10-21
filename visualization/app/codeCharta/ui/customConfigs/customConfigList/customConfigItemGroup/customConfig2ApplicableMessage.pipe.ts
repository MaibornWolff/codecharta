import { Inject, Pipe, PipeTransform } from "@angular/core"
import { CustomConfigItem } from "../../customConfigs.component"
import { State } from "../../../../state/angular-redux/state"
import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"

@Pipe({ name: "customConfig2ApplicableMessage" })
export class CustomConfig2ApplicableMessage implements PipeTransform {
	constructor(@Inject(State) private state: State) {}

	transform(customConfig: CustomConfigItem): string {
		const { mode, maps } = getMissingCustomConfigModeAndMaps(customConfig, this.state)

		if (maps.length > 0 && mode.length > 0) {
			return `This view is partially applicable. To complete your view, please switch to the ${mode} mode and select the following map(s): ${maps.join(
				", "
			)}.`
		}
		if (maps.length > 0) {
			return `To fulfill your view, please select the following map(s): ${maps.join(", ")}.`
		}
		if (mode.length > 0) {
			return `This view is partially applicable. To complete your view, please switch to the ${mode} mode.`
		}
		return `Apply Custom View`
	}
}
