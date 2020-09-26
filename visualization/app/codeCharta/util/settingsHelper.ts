import { RecursivePartial, Settings } from "../codeCharta.model"
import { Vector3 } from "three"

export function convertToVectors(settings: RecursivePartial<Settings>) {
	const DEFAULT_VALUE = 1

	for (const key of Object.keys(settings)) {
		if (typeof settings[key] === "object" && settings[key] !== null) {
			const { x, y, z } = settings[key]
			if (x !== undefined || y !== undefined || z !== undefined) {
				settings[key] = new Vector3(
					x ?? DEFAULT_VALUE,
					y ?? DEFAULT_VALUE,
					z ?? DEFAULT_VALUE
				)
			} else {
				convertToVectors(settings[key])
			}
		}
	}
}
