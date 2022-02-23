import { idToBuilding } from "./idToBuilding.reducer"
import { IdToBuildingAction, setIdToBuilding } from "./idToBuilding.actions"
import { CODE_MAP_BUILDING } from "../../../../util/dataMocks"

describe("idToBuilding", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = idToBuilding(undefined, {} as IdToBuildingAction)

			expect(result).toEqual(new Map())
		})
	})

	describe("Action: SET_ID_TO_BUILDING", () => {
		it("should set new idToBuilding", () => {
			const map = new Map()
			map.set(CODE_MAP_BUILDING.node.id, CODE_MAP_BUILDING)

			const result = idToBuilding(new Map(), setIdToBuilding(map))

			expect(result).toEqual(map)
		})

		it("should set default idToBuilding", () => {
			const map = new Map()
			map.set(CODE_MAP_BUILDING.node.id, CODE_MAP_BUILDING)

			const result = idToBuilding(map, setIdToBuilding())

			expect(result).toEqual(new Map())
		})
	})
})
