import { TEST_DELTA_MAP_A, VALID_NODE_WITH_ROOT_UNARY } from "../../../../util/dataMocks"
import { FileSelectionState, FileState } from "../../../../model/files/files"
import { BlacklistType } from "../../../../codeCharta.model"
import { NodeDecorator } from "../../../../util/nodeDecorator"
import { clone } from "../../../../util/clone"
import { NodeMetricDataService } from "../../../store/metricData/nodeMetricData/nodeMetricData.service"
import { calculateNodeMetricData } from "./nodeMetricData.selector"

describe("nodeMetricDataSelector", () => {
	let fileState: FileState

	beforeEach(() => {
		const file = clone(TEST_DELTA_MAP_A)
		NodeDecorator.decorateMapWithPathAttribute(file)
		fileState = {
			file,
			selectedAs: FileSelectionState.Partial
		}
	})

	it("should return a sorted array of metricData sorted by name calculated from visibleFileStates", () => {
		const expected = [
			{ maxValue: 1000, minValue: 10, name: "functions" },
			{ maxValue: 100, minValue: 1, name: "mcc" },
			{ maxValue: 100, minValue: 30, name: "rloc" },
			{ maxValue: 1, minValue: 1, name: NodeMetricDataService.UNARY_METRIC }
		]

		const result = calculateNodeMetricData([fileState], [])

		expect(result).toEqual(expected)
	})

	it("should ignore blacklisted nodes", () => {
		const expected = [
			{ maxValue: 1000, minValue: 100, name: "functions" },
			{ maxValue: 100, minValue: 10, name: "mcc" },
			{ maxValue: 70, minValue: 30, name: "rloc" },
			{ maxValue: 1, minValue: 1, name: NodeMetricDataService.UNARY_METRIC }
		]

		const result = calculateNodeMetricData([fileState], [{ path: "root/big leaf", type: BlacklistType.exclude }])

		expect(result).toEqual(expected)
	})

	it("should always add unary metric if it's not included yet", () => {
		const result = calculateNodeMetricData([fileState], [])

		expect(result.filter(x => x.name === NodeMetricDataService.UNARY_METRIC)).toHaveLength(1)
	})

	it("should not add unary metric a second time if the cc.json already contains unary", () => {
		fileState.file.map = VALID_NODE_WITH_ROOT_UNARY

		const result = calculateNodeMetricData([fileState], [])

		expect(result.filter(x => x.name === NodeMetricDataService.UNARY_METRIC).length).toBe(1)
	})

	it("should return empty metricData when there are no files selected. If it would contain default metrics someone might falsely assume all parsing was already done", () => {
		const result = calculateNodeMetricData([], [])
		expect(result.length).toBe(0)
	})
})
