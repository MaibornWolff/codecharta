import "./threeViewer.module"
import { instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"

describe("ThreeUpdateCycleService", () => {
	let threeUpdateCycleService: ThreeUpdateCycleService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")
	}

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
			const ref1 = jest.fn()

			threeUpdateCycleService.register(ref1)

			expect(threeUpdateCycleService["updatables"]).toEqual([ref1])
		})

		it("add multiple functions to updatable object", () => {
			const ref1 = jest.fn()
			const ref2 = jest.fn()

			threeUpdateCycleService.register(ref1)
			threeUpdateCycleService.register(ref2)

			expect(threeUpdateCycleService["updatables"]).toEqual([ref1, ref2])
		})
	})

	describe("update", () => {
		it("added updatable references should be updated on update call", () => {
			const ref1 = jest.fn()
			const ref2 = jest.fn()

			threeUpdateCycleService["updatables"].push(ref1, ref2)
			threeUpdateCycleService.update()

			expect(ref1).toHaveBeenCalledTimes(1)
			expect(ref2).toHaveBeenCalledTimes(1)
		})
	})
})
