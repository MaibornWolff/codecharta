import { Inject, Pipe, PipeTransform } from "@angular/core"
import { State } from "../../../../state/angular-redux/state"
import { CustomConfigItem } from "../../customConfigs.component"
import { getMissingCustomConfigModeAndMaps } from "./getMissingCustomConfigModeAndMaps"

@Pipe({ name: "customConfig2ApplicableColor" })
export class CustomConfig2ApplicableColor implements PipeTransform {
	constructor(@Inject(State) private state: State) {}

	transform(customConfig: CustomConfigItem): string {
		const { mode, maps } = getMissingCustomConfigModeAndMaps(customConfig, this.state)
		return maps.length > 0 || mode.length > 0 ? "rgb(204, 204, 204)" : "rgba(0, 0, 0, 0.87)"
	}
}
