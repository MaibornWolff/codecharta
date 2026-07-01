import { firstValueFrom, of } from "rxjs"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { clone } from "../../../util/clone"
import { createBlacklistMatcher } from "../../../util/blacklist/blacklistMatcher"
import { TEST_DELTA_MAP_A } from "../../../mocks/dataMocks"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { calculateNodeMetricData } from "../store/nodeMetricData.calculator"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { rangeOfMetric } from "../store/metricsLens.selectors"
import { MetricsLensStore } from "../store/metricsLens.store"
import { AttributesRepo } from "./attributes.repo"

describe("AttributesRepo", () => {
    let nodeMetricData: ReturnType<typeof calculateNodeMetricData>
    let repo: AttributesRepo

    beforeEach(() => {
        const file = clone(TEST_DELTA_MAP_A)
        NodeDecorator.decorateMapWithPathAttribute(file)
        const fileState: FileState = { file, selectedAs: FileSelectionState.Partial }
        nodeMetricData = calculateNodeMetricData([fileState], createBlacklistMatcher([]))

        const fakeStore: Pick<MetricsLensStore, "nodeMetricData$" | "colorMetricRange$" | "getNodeMetricData" | "getColorMetricRange"> = {
            nodeMetricData$: of(nodeMetricData),
            colorMetricRange$: of(rangeOfMetric(nodeMetricData, "rloc")),
            getNodeMetricData: () => nodeMetricData,
            getColorMetricRange: () => rangeOfMetric(nodeMetricData, "rloc")
        }
        repo = new AttributesRepo(fakeStore as MetricsLensStore)
    })

    it("should value-equal selectedColorMetricDataSelector for rangeOf(colorMetric)", () => {
        const metricData = { nodeMetricData, edgeMetricData: [], nodeEdgeMetricsMap: new Map() }
        const expected = selectedColorMetricDataSelector.projector(metricData, "rloc")

        expect(repo.rangeOf("rloc")).toEqual(expected)
    })

    it("should fall back to the empty range for a missing metric", () => {
        expect(repo.rangeOf("missing")).toEqual({ values: [], minValue: 0, maxValue: 0 })
    })

    it("should expose the full node metric data array for the render path", () => {
        expect(repo.getNodeMetricData()).toEqual(nodeMetricData)
    })

    it("should list the sorted available metric names", () => {
        expect(repo.availableMetrics()).toEqual(nodeMetricData.map(metricData => metricData.name))
    })

    it("should emit rangeOf$ equal to the sync rangeOf", async () => {
        await expect(firstValueFrom(repo.rangeOf$("rloc"))).resolves.toEqual(repo.rangeOf("rloc"))
    })
})
