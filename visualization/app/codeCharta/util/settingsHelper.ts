import _ from "lodash"
import { RecursivePartial, Settings } from "../codeCharta.model"
import { Vector3 } from "three"

export function convertToVectors(settings: RecursivePartial<Settings>) {
	const DEFAULT_VALUE = 1

	for (let key of Object.keys(settings)) {
		if (_.isObject(settings[key])) {
			const xExists = settings[key]["x"] !== undefined
			const yExists = settings[key]["y"] !== undefined
			const zExists = settings[key]["z"] !== undefined

			if (xExists || yExists || zExists) {
				settings[key] = new Vector3(
					xExists ? settings[key].x : DEFAULT_VALUE,
					yExists ? settings[key].y : DEFAULT_VALUE,
					zExists ? settings[key].z : DEFAULT_VALUE
				)
			}
			convertToVectors(settings[key])
		}
	}
}
