import { RecursivePartial, State } from "../model/codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { Vector3 } from "three"

describe("SettingsHelper", () => {
	describe("convertToVectors", () => {
		it("should transform object to Vector3 with smaller state", () => {
			const partialState = {
				appSettings: {
					scaling: { y: 27 }
				}
			}

			const expected: RecursivePartial<State> = {
				appSettings: {
					scaling: new Vector3(1, 27, 1)
				}
			}

			convertToVectors((partialState as any) as RecursivePartial<State>)

			expect(partialState).toEqual(expected)
		})

		it("should transform object to Vector3 with larger state", () => {
			const partialState = {
				appSettings: {
					scaling: { y: 27 },
					invertHeight: false,
					camera: { x: 10, y: 20, z: 30 },
					amountOfTopLabels: 23
				}
			}

			const expected: RecursivePartial<State> = {
				appSettings: {
					scaling: new Vector3(1, 27, 1),
					invertHeight: false,
					camera: new Vector3(10, 20, 30),
					amountOfTopLabels: 23
				}
			}

			convertToVectors((partialState as any) as RecursivePartial<State>)

			expect(partialState).toEqual(expected)
		})
	})
})
