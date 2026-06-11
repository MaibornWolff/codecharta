import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { inspectorMappingBlocksSelector, MappingBlock } from "../../selectors/inspectorMappingBlocks.selector"
import { InspectorMetricMappingComponent } from "./inspectorMetricMapping.component"

const mappingBlocks: MappingBlock[] = [
    { kind: "area", metricName: "rloc", value: 842 },
    { kind: "height", metricName: "mcc", value: 41 },
    { kind: "color", metricName: "coverage", value: 62, inverted: true }
]

describe("InspectorMetricMappingComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideMockStore({ selectors: [{ selector: inspectorMappingBlocksSelector, value: mappingBlocks }] })]
        })
    })

    it("should render one block per mapping", async () => {
        // Arrange & Act
        const { container } = await render(InspectorMetricMappingComponent)

        // Assert
        expect(container.querySelectorAll("cc-inspector-mapping-block").length).toBe(3)
        expect(screen.getByTestId("mapping-block-name-area").textContent).toContain("rloc")
        expect(screen.getByTestId("mapping-block-name-height").textContent).toContain("mcc")
        expect(screen.getByTestId("mapping-block-name-color").textContent).toContain("coverage")
    })
})
