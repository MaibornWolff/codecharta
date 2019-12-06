import { setState } from "./state.actions"
import { splitStateActions } from "./state.splitter"
import { BlacklistType, CCAction, RecursivePartial, State } from "../../codeCharta.model"
import { AreaMetricActions } from "./dynamicSettings/areaMetric/areaMetric.actions"
import { HeightMetricActions } from "./dynamicSettings/heightMetric/heightMetric.actions"
import { ColorMetricActions } from "./dynamicSettings/colorMetric/colorMetric.actions"
import _ from "lodash"
import { FocusedNodePathActions } from "./dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { Vector3 } from "three"
import { EdgeHeightActions } from "./appSettings/edgeHeight/edgeHeight.actions"
import { CameraActions } from "./appSettings/camera/camera.actions"
import { BlacklistActions } from "./fileSettings/blacklist/blacklist.actions"

describe("state.splitter", () => {
	function getItemsOfType(array: CCAction[], actionTypes: string[]) {
		return array.filter(action => !!actionTypes.find(type => type === action.type))
	}

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
