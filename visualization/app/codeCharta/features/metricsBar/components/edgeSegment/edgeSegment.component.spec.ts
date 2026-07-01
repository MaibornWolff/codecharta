import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { Observable, of } from "rxjs"
import { CodeMapNode, Node } from "../../../../codeCharta.model"
import { isEdgeMetricVisibleSelector } from "../../../../appearance/appearance.facade"
import { setEdgeMetric } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { EdgeSegmentComponent } from "./edgeSegment.component"

describe("EdgeSegmentComponent", () => {
    async function setup(edgeMetric = "pairingRate", isEdgeMetricVisible = true, node: CodeMapNode | Node | undefined = undefined) {
        const node$: Observable<CodeMapNode | Node | undefined> = of(node)
        const renderResult = await render(EdgeSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: edgeMetricSelector, value: edgeMetric },
                        { selector: isEdgeMetricVisibleSelector, value: isEdgeMetricVisible }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: NodeSelectionService,
                    useValue: { createNodeObservable: () => node$ }
                },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
        return { ...renderResult, component: renderResult.fixture.componentInstance }
    }

    it("should forward the Edges label and selected metric name to the axis card", async () => {
        // Arrange & Act
        await setup("pairingRate")

        // Assert
        expect(screen.getByText("Edges")).not.toBeNull()
        expect(screen.getByText("pairingRate")).not.toBeNull()
    })

    it("should expose the edge-specific test ids", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-edges")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-edges-cog")).not.toBeNull()
    })

    it("should display the incoming and outgoing edge values for the hovered node", async () => {
        // Arrange
        const hoveredNode = { edgeAttributes: { pairingRate: { incoming: 1234, outgoing: 5 } } } as unknown as CodeMapNode

        // Act
        const { component } = await setup("pairingRate", true, hoveredNode)

        // Assert
        expect(component.hoveredEdgeValue()).toBe(`${(1234).toLocaleString()} / ${(5).toLocaleString()}`)
        expect(screen.getByText(`${(1234).toLocaleString()} / ${(5).toLocaleString()}`)).not.toBeNull()
    })

    it("should render a dash for an edge attribute value that is not a number", async () => {
        // Arrange
        const hoveredNode = { edgeAttributes: { pairingRate: { incoming: 7 } } } as unknown as CodeMapNode

        // Act
        const { component } = await setup("pairingRate", true, hoveredNode)

        // Assert
        expect(component.hoveredEdgeValue()).toBe(`${(7).toLocaleString()} / -`)
    })

    it("should return null when there is no hovered node", async () => {
        // Arrange & Act
        const { component } = await setup("pairingRate", true, undefined)

        // Assert
        expect(component.hoveredEdgeValue()).toBeNull()
    })

    it("should return null when the hovered node has no edge attributes for the metric", async () => {
        // Arrange
        const hoveredNode = { edgeAttributes: {} } as unknown as CodeMapNode

        // Act
        const { component } = await setup("pairingRate", true, hoveredNode)

        // Assert
        expect(component.hoveredEdgeValue()).toBeNull()
    })

    it("should return null when no edge metric is selected", async () => {
        // Arrange
        const hoveredNode = { edgeAttributes: { pairingRate: { incoming: 1, outgoing: 2 } } } as unknown as CodeMapNode

        // Act
        const { component } = await setup("", true, hoveredNode)

        // Assert
        expect(component.hoveredEdgeValue()).toBeNull()
    })

    it("should dispatch setEdgeMetric when a metric is selected", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleMetricSelected("avgCommits")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(setEdgeMetric({ value: "avgCommits" }))
    })

    it("should wire the settings cog to the edge settings popover via popovertarget", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const cogButton = screen.getByTestId("metric-segment-edges-cog")
        expect(cogButton.getAttribute("popovertarget")).toBe("metric-settings-popover-edge")
        expect(document.getElementById("metric-settings-popover-edge")).not.toBeNull()
        expect(document.getElementById("metric-select-popover-edge")).not.toBeNull()
    })
})
