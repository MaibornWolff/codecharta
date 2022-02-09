import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { mocked } from "ts-jest/utils"
import { trackEventUsageData } from "../../../util/usageDataTracker"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { areAllNecessaryRenderDataAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { FocusedNodePathActions, focusNode } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { TrackEventUsageDataEffect } from "./trackEventUsageData.effect"

jest.mock("../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector", () => ({
	areAllNecessaryRenderDataAvailableSelector: jest.fn()
}))
const mockedAreAllNecessaryRenderDataAvailableSelector = mocked(areAllNecessaryRenderDataAvailableSelector)
jest.mock("../../../util/usageDataTracker", () => ({
	trackEventUsageData: jest.fn()
}))
const mockedTrackEventUsageData = mocked(trackEventUsageData)

describe("TrackEventUsageDataEffect", () => {
	afterEach(() => {
		EffectsModule.actions$.complete()
		mockedTrackEventUsageData.mockClear()
	})

	it("should ignore an action, when all necessary render data aren't available", async () => {
		mockedAreAllNecessaryRenderDataAvailableSelector.mockImplementation(() => false)
		await initEffects()
		EffectsModule.actions$.next(focusNode("root/leaf.ts"))
		expect(trackEventUsageData).not.toHaveBeenCalled()
	})

	it("should track an action, when all necessary render data are available", async () => {
		mockedAreAllNecessaryRenderDataAvailableSelector.mockImplementation(() => true)
		await initEffects()
		EffectsModule.actions$.next(focusNode("root/leaf.ts"))
		expect(trackEventUsageData).toHaveBeenCalledTimes(1)
		expect(trackEventUsageData).toHaveBeenCalledWith(FocusedNodePathActions.FOCUS_NODE, [], "root/leaf.ts")
	})

	it("should ignore an action, which is not listed internally", async () => {
		mockedAreAllNecessaryRenderDataAvailableSelector.mockImplementation(() => true)
		await initEffects()
		EffectsModule.actions$.next({ type: "I do not exist" })
		expect(trackEventUsageData).not.toHaveBeenCalled()
	})

	async function initEffects() {
		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([TrackEventUsageDataEffect])]
		})
		return TestBed.inject(ApplicationInitStatus).donePromise
	}
})
