import { pathToBuilding } from "./pathToBuilding.reducer"
import { PathToBuildingAction, setPathToBuilding } from "./pathToBuilding.actions"
import { CODE_MAP_BUILDING } from "../../../../util/dataMocks"

describe("pathToBuilding", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = pathToBuilding(undefined, {} as PathToBuildingAction)

			expect(result).toEqual(new Map())
		})
	})

	describe("Action: SET_PATH_TO_BUILDING", () => {
		it("should set new pathToBuilding", () => {
			const map = new Map()
			map.set(CODE_MAP_BUILDING.node.path, CODE_MAP_BUILDING)

			const result = pathToBuilding(new Map(), setPathToBuilding(map))

			expect(result).toEqual(map)
		})

		it("should set default pathToBuilding", () => {
			const map = new Map()
			map.set(CODE_MAP_BUILDING.node.path, CODE_MAP_BUILDING)

			const result = pathToBuilding(map, setPathToBuilding())

			expect(result).toEqual(new Map())
		})
	})
})
