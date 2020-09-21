import "./threeViewer.module"
import { instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"

function restartSystem() {
	instantiateModule("app.codeCharta.ui.codeMap.threeViewer")
}

describe("ThreeUpdateCycleService", () => {
	let threeUpdateCycleService: ThreeUpdateCycleService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function rebuildService() {
		threeUpdateCycleService = new ThreeUpdateCycleService()
	}

	describe("constructor", () => {
		it("should retrieve the angular service instance", () => {
			expect(threeUpdateCycleService).not.toBe(undefined)
		})

		it("should have no updatable references when instantiated", () => {
			expect(threeUpdateCycleService["updatables"].length).toBe(0)
		})
	})

	describe("register", () => {
		it("add one function to updatable object", () => {
			const reference1 = jest.fn()

			threeUpdateCycleService.register(reference1)

			expect(threeUpdateCycleService["updatables"]).toEqual([reference1])
		})

		it("add multiple functions to updatable object", () => {
			const reference1 = jest.fn()
			const reference2 = jest.fn()

			threeUpdateCycleService.register(reference1)
			threeUpdateCycleService.register(reference2)

			expect(threeUpdateCycleService["updatables"]).toEqual([reference1, reference2])
		})
	})

	describe("update", () => {
		it("added updatable references should be updated on update call", () => {
			const reference1 = jest.fn()
			const reference2 = jest.fn()

			threeUpdateCycleService["updatables"].push(reference1, reference2)
			threeUpdateCycleService.update()

			expect(reference1).toHaveBeenCalledTimes(1)
			expect(reference2).toHaveBeenCalledTimes(1)
		})
	})
})
