import { Store } from "../../store/store"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { ApplicationInitStatus } from "@angular/core"
import { UpdateVisibleTopLabelsEffect } from "./updateVisibleTopLabels.effect"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setFiles } from "../../store/files/files.actions"
import { FILE_STATES } from "../../../util/dataMocks"

describe("updateVisibleTopLabelsEffect", () => {
	let dispatchSpy

	beforeEach(async () => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateVisibleTopLabelsEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise

		dispatchSpy = jest.spyOn(Store.store, "dispatch")
	})

	it("should ignore a not relevant action", () => {
		Store.dispatch({ type: "whatever" })
		expect(dispatchSpy).toHaveBeenCalledTimes(1)
	})

	it("should set setAmountOfTopLabels to 1 on FileState change", () => {
		Store.dispatch(setFiles(FILE_STATES))
		expect(dispatchSpy.mock.calls[1][0]).toEqual(setAmountOfTopLabels())
		expect(dispatchSpy.mock.calls[1][0].payload).toBe(1)
	})
})
