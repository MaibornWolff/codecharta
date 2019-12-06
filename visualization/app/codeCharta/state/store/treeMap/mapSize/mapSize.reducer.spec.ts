import { mapSize } from "./mapSize.reducer"
import { MapSizeAction, setMapSize } from "./mapSize.actions"

describe("mapSize", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = mapSize(undefined, {} as MapSizeAction)

			expect(result).toEqual(250)
		})
	})

	describe("Action: SET_MAP_SIZE", () => {
		it("should set new mapSize", () => {
			const result = mapSize(250, setMapSize(42))

			expect(result).toEqual(42)
		})

		it("should set default mapSize", () => {
			const result = mapSize(42, setMapSize())

			expect(result).toEqual(250)
		})
	})
})
