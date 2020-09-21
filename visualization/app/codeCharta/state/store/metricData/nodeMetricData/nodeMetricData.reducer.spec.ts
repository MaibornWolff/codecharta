import { nodeMetricData } from "./nodeMetricData.reducer"
import { calculateNewNodeMetricData, NodeMetricDataAction, setNodeMetricData } from "./nodeMetricData.actions"
import { METRIC_DATA, TEST_DELTA_MAP_A, VALID_NODE_WITH_ROOT_UNARY } from "../../../../util/dataMocks"
import { FileSelectionState, FileState } from "../../../../model/files/files"
import { BlacklistType } from "../../../../codeCharta.model"
import { NodeDecorator } from "../../../../util/nodeDecorator"
import { NodeMetricDataService } from "./nodeMetricData.service"
import { clone } from "../../../../util/clone"

describe("nodeMetricData", () => {
	let fileState: FileState

	beforeEach(() => {
		const file = clone(TEST_DELTA_MAP_A)
		NodeDecorator.decorateMapWithPathAttribute(file)
		fileState = {
			file,
			selectedAs: FileSelectionState.Single
		}
	})

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = nodeMetricData(undefined, {} as NodeMetricDataAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_NODE_METRIC_DATA", () => {
		it("should set new nodeMetricData", () => {
			const result = nodeMetricData([], setNodeMetricData(METRIC_DATA))

			expect(result).toEqual(METRIC_DATA)
		})

		it("should set default nodeMetricData", () => {
			const result = nodeMetricData(METRIC_DATA, setNodeMetricData())

			expect(result).toEqual([])
		})
	})

	describe("Action: CALCULATE_NEW_METRIC_DATA", () => {
		it("should return a sorted array of metricData sorted by name calculated from visibleFileStates", () => {
			const expected = [
				{ maxValue: 1000, name: "functions" },
				{ maxValue: 100, name: "mcc" },
				{ maxValue: 100, name: "rloc" },
				{ maxValue: 1, name: NodeMetricDataService.UNARY_METRIC }
			]

			const result = nodeMetricData([], calculateNewNodeMetricData([fileState], []))

			expect(result).toEqual(expected)
		})

		it("should ignore blacklisted nodes", () => {
			const expected = [
				{ maxValue: 1000, name: "functions" },
				{ maxValue: 100, name: "mcc" },
				{ maxValue: 70, name: "rloc" },
				{ maxValue: 1, name: NodeMetricDataService.UNARY_METRIC }
			]

			const result = nodeMetricData(
				[],
				calculateNewNodeMetricData([fileState], [{ path: "root/big leaf", type: BlacklistType.exclude }])
			)

			expect(result).toEqual(expected)
		})

		it("should always add unary metric if it's not included yet", () => {
			const result = nodeMetricData([], calculateNewNodeMetricData([fileState], []))

			expect(result.filter(x => x.name === NodeMetricDataService.UNARY_METRIC)).toHaveLength(1)
		})

		it("should not add unary metric a second time if the cc.json already contains unary", () => {
			fileState.file.map = VALID_NODE_WITH_ROOT_UNARY

			const result = nodeMetricData([], calculateNewNodeMetricData([fileState], []))

			expect(result.filter(x => x.name === NodeMetricDataService.UNARY_METRIC).length).toBe(1)
		})
	})
})
