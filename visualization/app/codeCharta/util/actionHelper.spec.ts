import { isActionOfType } from "./actionHelper"
import { ScalingActions } from "../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingFileActions } from "../state/store/appSettings/isLoadingFile/isLoadingFile.actions"

describe("actionHelper", () => {
	it("should return true if an action is part of an enum", () => {
		const result = isActionOfType(ScalingActions.SET_SCALING, ScalingActions)

		expect(result).toBeTruthy()
	})

	it("should return false if an action is not part of an enum", () => {
		const result = isActionOfType(IsLoadingFileActions.SET_IS_LOADING_FILE, ScalingActions)

		expect(result).toBeFalsy()
	})
})
