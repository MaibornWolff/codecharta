import { setState } from "./state.actions"
import { splitStateActions } from "./state.splitter"
import { BlacklistType, CCAction, DynamicSettings, FileSettings, RecursivePartial, State } from "../../codeCharta.model"
import { AreaMetricActions } from "./dynamicSettings/areaMetric/areaMetric.actions"
import { HeightMetricActions } from "./dynamicSettings/heightMetric/heightMetric.actions"
import { ColorMetricActions } from "./dynamicSettings/colorMetric/colorMetric.actions"
import _ from "lodash"
import { FocusedNodePathActions } from "./dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { Vector3 } from "three"
import { EdgeHeightActions } from "./appSettings/edgeHeight/edgeHeight.actions"
import { CameraActions } from "./appSettings/camera/camera.actions"
import { BlacklistActions } from "./fileSettings/blacklist/blacklist.actions"
import { setDynamicSettings } from "./dynamicSettings/dynamicSettings.actions"
import { setFileSettings } from "./fileSettings/fileSettings.actions"
import { ScalingActions } from "./appSettings/scaling/scaling.actions"
import { setAppSettings } from "./appSettings/appSettings.actions"

function getItemsOfType(array: CCAction[], actionTypes: string[]) {
	return array.filter(action => actionTypes.some(type => type === action.type))
}

describe("state.splitter", () => {
	describe("setState", () => {
		it("should return 3 atomic actions", () => {
			const partialState: RecursivePartial<State> = {
				dynamicSettings: {
					areaMetric: "another_area_metric",
					heightMetric: "another_height_metric",
					colorMetric: "another_color_metric"
				}
			}

			const result: CCAction[] = splitStateActions(setState(partialState))

			expect(result.length).toEqual(3)
			expect(getItemsOfType(result, _.values(AreaMetricActions))).toHaveLength(1)
			expect(getItemsOfType(result, _.values(HeightMetricActions))).toHaveLength(1)
			expect(getItemsOfType(result, _.values(ColorMetricActions))).toHaveLength(1)
		})

		it("should return 1 FOCUS_NODE action", () => {
			const partialState: RecursivePartial<State> = {
				dynamicSettings: {
					focusedNodePath: "/some/path"
				}
			}

			const result: CCAction[] = splitStateActions(setState(partialState))

			expect(result.length).toEqual(1)

			expect(result[0].type).toEqual(FocusedNodePathActions.FOCUS_NODE)
		})

		it("should return 3 atomic actions from different parts of the state", () => {
			const partialState: RecursivePartial<State> = {
				dynamicSettings: {
					areaMetric: "another_area_metric",
					heightMetric: "another_height_metric"
				},
				appSettings: {
					edgeHeight: 42,
					camera: new Vector3(20, 40, 60)
				},
				fileSettings: {
					blacklist: [{ path: "/some/path", type: BlacklistType.exclude }]
				}
			}

			const result: CCAction[] = splitStateActions(setState(partialState))

			expect(result.length).toEqual(5)
			expect(getItemsOfType(result, _.values(AreaMetricActions))).toHaveLength(1)
			expect(getItemsOfType(result, _.values(HeightMetricActions))).toHaveLength(1)
			expect(getItemsOfType(result, _.values(EdgeHeightActions))).toHaveLength(1)
			expect(getItemsOfType(result, _.values(CameraActions))).toHaveLength(1)
			expect(getItemsOfType(result, _.values(BlacklistActions))).toHaveLength(1)
		})
	})

	describe("setDynamicSettings", () => {
		it("should return 1 FOCUS_NODE action", () => {
			const partialDynamicSettings: RecursivePartial<DynamicSettings> = {
				focusedNodePath: "/some/path"
			}

			const result: CCAction[] = splitStateActions(setDynamicSettings(partialDynamicSettings))

			expect(result.length).toEqual(1)
			expect(result[0].type).toEqual(FocusedNodePathActions.FOCUS_NODE)
			expect(result[0].payload).toEqual(partialDynamicSettings.focusedNodePath)
		})
	})

	describe("setFileSettings", () => {
		it("should return 1 SET_BLACKLIST action", () => {
			const partialFileSettings: RecursivePartial<FileSettings> = {
				blacklist: [{ path: "/some/path", type: BlacklistType.exclude }]
			}

			const result: CCAction[] = splitStateActions(setFileSettings(partialFileSettings))

			expect(result.length).toEqual(1)
			expect(result[0].type).toEqual(BlacklistActions.SET_BLACKLIST)
			expect(result[0].payload).toEqual(partialFileSettings.blacklist)
		})
	})

	describe("setAppSettings", () => {
		it("should return 1 SET_SCALING action", () => {
			const partialAppSettings = {
				scaling: new Vector3(2, 3, 4)
			}

			const result: CCAction[] = splitStateActions(setAppSettings(partialAppSettings))

			expect(result.length).toEqual(1)
			expect(result[0].type).toEqual(ScalingActions.SET_SCALING)
			expect(result[0].payload).toEqual(partialAppSettings.scaling)
		})
	})
})
