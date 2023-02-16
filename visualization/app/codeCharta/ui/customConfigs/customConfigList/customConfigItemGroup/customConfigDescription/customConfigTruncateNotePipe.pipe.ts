import { Pipe, PipeTransform } from "@angular/core"
import { State } from "../../../../../state/angular-redux/state"

@Pipe({ name: "customConfigTransformNote" })
export class CustomConfigTransformNote implements PipeTransform {
	constructor(private state: State) {}

	transform(stringToTransfrom: string, limit, replacerString = "...") {
		if (!stringToTransfrom) {
			return "Add note"
		}

		return stringToTransfrom.length > limit ? stringToTransfrom.slice(0, limit) + replacerString : stringToTransfrom
	}
}
