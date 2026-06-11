import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CodeMapNode } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { selectedBuildingIdSelector } from "../../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { inspectorMappingBlocksSelector, MappingBlock } from "../../selectors/inspectorMappingBlocks.selector"
import { inspectorMetricRowsSelector, MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { SidebarInspectorComponent } from "./sidebarInspector.component"

const node = { name: "invoice.ts", path: "/root/services/billing/invoice.ts", attributes: { unary: 1 } } as unknown as CodeMapNode
const mappingBlocks: MappingBlock[] = [
    { kind: "area", metricName: "rloc", min: 12, max: 4208 },
    { kind: "height", metricName: "mcc", min: 1, max: 62 }
]
const metricRows: MetricRow[] = [{ name: "rloc", value: 842, fraction: 0.8, severity: "error" }]

describe("SidebarInspectorComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: undefined },
                        { selector: selectedBuildingIdSelector, value: null },
                        { selector: isDeltaStateSelector, value: false },
                        { selector: mapColorsSelector, value: defaultMapColors },
                        { selector: inspectorMappingBlocksSelector, value: mappingBlocks },
                        { selector: inspectorMetricRowsSelector, value: metricRows }
                    ]
                })
            ]
        })
    })

    function selectBuilding() {
        const mockStore = TestBed.inject(MockStore)
        mockStore.overrideSelector(selectedNodeSelector, node)
        mockStore.overrideSelector(selectedBuildingIdSelector, 1)
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

    it("should slide out after clicking the close button", async () => {
        // Arrange
        const { fixture, detectChanges } = await render(SidebarInspectorComponent)
        selectBuilding()
        detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("inspector-close-button"))

        // Assert
        await waitFor(() => expect((fixture.nativeElement as HTMLElement).className).toContain("translate-x-full"))
    })
})
