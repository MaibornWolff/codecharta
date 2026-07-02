import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CodeMapNode } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { defaultMapColors, mapColorsSelector } from "../../../../mapState/mapState.facade"
import { ThreeRendererService } from "../../../../features/codeMap/facade"
import { ThreeSceneService } from "../../../../features/codeMap/facade"
import { inspectorMappingBlocksSelector, MappingBlock } from "../../selectors/inspectorMappingBlocks.selector"
import { inspectorMetricRowsSelector, MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { SidebarInspectorComponent } from "./sidebarInspector.component"

const node = { name: "invoice.ts", path: "/root/services/billing/invoice.ts", attributes: { unary: 1 } } as unknown as CodeMapNode
const mappingBlocks: MappingBlock[] = [
    { kind: "area", metricName: "rloc", value: 842 },
    { kind: "height", metricName: "mcc", value: 41 }
]
const metricRows: MetricRow[] = [
    { name: "rloc", value: 842, mapBar: { fraction: 0.8, severity: "error" }, rangeBar: { fraction: 0.4, severity: "warning" } }
]

describe("SidebarInspectorComponent", () => {
    const clearSelection = jest.fn()

    beforeEach(() => {
        clearSelection.mockClear()
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: undefined },
                        { selector: isDeltaStateSelector, value: false },
                        { selector: mapColorsSelector, value: defaultMapColors },
                        { selector: inspectorMappingBlocksSelector, value: mappingBlocks },
                        { selector: inspectorMetricRowsSelector, value: metricRows }
                    ]
                }),
                { provide: ThreeSceneService, useValue: { clearSelection } },
                { provide: ThreeRendererService, useValue: { render: jest.fn() } }
            ]
        })
    })

    function selectBuilding() {
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(selectedNodeSelector, node)
        mockStore.refreshState()
    }

    function deselectBuilding() {
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(selectedNodeSelector, undefined)
        mockStore.refreshState()
    }

    it("should stay off-screen while no building is selected", async () => {
        // Arrange & Act
        const { fixture } = await render(SidebarInspectorComponent)

        // Assert
        expect((fixture.nativeElement as HTMLElement).className).toContain("translate-x-full")
    })

    it("should slide in and show all sections when a building is selected", async () => {
        // Arrange
        const { fixture, detectChanges } = await render(SidebarInspectorComponent)

        // Act
        selectBuilding()
        detectChanges()

        // Assert
        expect((fixture.nativeElement as HTMLElement).className).not.toContain("translate-x-full")
        expect(screen.getByText("Inspector")).not.toBe(null)
        expect(screen.getByText("Metric Mapping")).not.toBe(null)
        expect(screen.getByText("Metrics")).not.toBe(null)
        expect(screen.getByTestId("inspector-node-name").textContent).toContain("invoice.ts")
    })

    it("should deselect the building and slide out when clicking the close button", async () => {
        // Arrange
        const { fixture, detectChanges } = await render(SidebarInspectorComponent)
        selectBuilding()
        detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("inspector-close-button"))
        deselectBuilding()
        detectChanges()

        // Assert
        expect(clearSelection).toHaveBeenCalled()
        await waitFor(() => expect((fixture.nativeElement as HTMLElement).className).toContain("translate-x-full"))
    })
})
