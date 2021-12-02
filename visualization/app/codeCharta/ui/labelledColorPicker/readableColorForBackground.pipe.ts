import { Pipe } from "@angular/core"

import { getReadableColorForBackground } from "../customColorPicker/colorHelper"

@Pipe({ name: "readableColorForBackground" })
export class ReadableColorForBackgroundPipe {
	transform(hexColor: string) {
		return getReadableColorForBackground(hexColor)
	}
}
