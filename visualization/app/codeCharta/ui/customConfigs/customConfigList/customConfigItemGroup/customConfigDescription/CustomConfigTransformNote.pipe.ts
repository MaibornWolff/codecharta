import { Pipe, PipeTransform } from "@angular/core"

@Pipe({ name: "customConfigTransformNote" })
export class CustomConfigTransformNote implements PipeTransform {
	transform(stringToTransfrom: string, limit, replacerString = "...") {
		if (!stringToTransfrom) {
			return "Add note"
		}

		return stringToTransfrom.length > limit ? stringToTransfrom.slice(0, limit) + replacerString : stringToTransfrom
	}
}
