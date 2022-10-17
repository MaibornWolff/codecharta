import { Inject, Pipe, PipeTransform } from "@angular/core"
import { State } from "../../../../state/angular-redux/state"
import { CustomConfigItem } from "../../customConfigs.component"
import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"

@Pipe({ name: "customConfig2ApplicableColor" })
export class CustomConfig2ApplicableColor implements PipeTransform {
	constructor(@Inject(State) private state: State) {}

	transform(customConfig: CustomConfigItem): string {
		const { mode, missingMaps } = getMissingCustomConfigModeAndMaps(customConfig, this.state)

		if (missingMaps.length > 0 || mode.length > 0) {
			return "rgb(204, 204, 204)"
		}

		return "rgba(0, 0, 0, 0.87)"
	}
}
