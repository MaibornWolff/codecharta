import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { edgeMetricDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { setEdgeMetric } from "../../../../stores/mapState/mapState.write.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { EdgeMetricSegmentComponent } from "./edgeMetricSegment.component"

const EDGE_METRICS = [
    { name: "dependencies", maxValue: 12, minValue: 1, values: [] },
    { name: "temporal_coupling", maxValue: 1, minValue: 0.1, values: [] }
]

async function setup() {
    const { fixture } = await render(EdgeMetricSegmentComponent, {
        providers: [
            { provide: State, useValue: { getValue: () => defaultState } },
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: edgeMetricSelector, value: "dependencies" },
                    { selector: edgeMetricDataSelector, value: EDGE_METRICS }
                ]
            })
        ]
    })
    const dispatch = jest.spyOn(TestBed.inject(MockStore), "dispatch")
    return { segment: fixture.componentInstance, dispatch }
}

describe("EdgeMetricSegmentComponent", () => {
    it("should name the edge metric the graph is drawn for", async () => {
        // Act
        await setup()

        // Assert
        expect(screen.getByTestId("dependency-bar-edge-metric-segment").textContent).toContain("dependencies")
    })

    it("should offer the map's edge metrics to pick from", async () => {
        // Act
        const { segment } = await setup()

        // Assert
        expect(segment.edgeMetricData().map(metric => metric.name)).toEqual(["dependencies", "temporal_coupling"])
    })

    it("should set the edge metric it shares with the Metric view", async () => {
        // Arrange
        const { segment, dispatch } = await setup()

        // Act
        segment.pick("temporal_coupling")

        // Assert
        expect(dispatch).toHaveBeenCalledWith(setEdgeMetric({ value: "temporal_coupling" }))
    })
})
