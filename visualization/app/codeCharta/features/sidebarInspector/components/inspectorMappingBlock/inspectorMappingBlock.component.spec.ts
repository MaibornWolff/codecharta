import { render, screen } from "@testing-library/angular"
import { MappingBlock } from "../../selectors/inspectorMappingBlocks.selector"
import { InspectorMappingBlockComponent } from "./inspectorMappingBlock.component"

describe("InspectorMappingBlockComponent", () => {
    it("should display the metric name and the node's formatted value", async () => {
        // Arrange
        const block: MappingBlock = { kind: "area", metricName: "real_lines_of_code", value: 4208 }

        // Act
        await render(InspectorMappingBlockComponent, { inputs: { block } })

        // Assert
        expect(screen.getByTestId("mapping-block-name-area").textContent).toContain("real_lines_of_code")
        expect(screen.getByTestId("mapping-block-value-area").textContent).toContain("4,208")
    })

    it("should display a placeholder when the node does not carry the mapped metric", async () => {
        // Arrange
        const block: MappingBlock = { kind: "height", metricName: "mcc", value: undefined }

        // Act
        await render(InspectorMappingBlockComponent, { inputs: { block } })

        // Assert
        expect(screen.getByTestId("mapping-block-value-height").textContent).toContain("-")
    })

    it("should mark an inverted color mapping", async () => {
        // Arrange
        const block: MappingBlock = { kind: "color", metricName: "coverage", value: 62, inverted: true }

        // Act
        await render(InspectorMappingBlockComponent, { inputs: { block } })

        // Assert
        expect(screen.getByTestId("mapping-block-inverted").textContent).toContain("inverted")
    })

    it("should not mark a regular color mapping as inverted", async () => {
        // Arrange
        const block: MappingBlock = { kind: "color", metricName: "coverage", value: 62, inverted: false }

        // Act
        await render(InspectorMappingBlockComponent, { inputs: { block } })

        // Assert
        expect(screen.queryByTestId("mapping-block-inverted")).toBe(null)
    })

    it("should display the node's in and out counts for the edge block", async () => {
        // Arrange
        const block: MappingBlock = { kind: "edge", metricName: "pairingRate", incoming: 5, outgoing: 3 }

        // Act
        await render(InspectorMappingBlockComponent, { inputs: { block } })

        // Assert
        expect(screen.getByTestId("mapping-block-value-edge").textContent).toContain("5/3")
        expect(screen.getByTestId("mapping-block-value-edge").textContent).toContain("(in/out)")
    })

    it("should link the metric name when the descriptor provides a link", async () => {
        // Arrange
        const block: MappingBlock = {
            kind: "height",
            metricName: "mcc",
            value: 41,
            descriptor: { title: "", description: "", hintLowValue: "", hintHighValue: "", link: "https://docs.example.com" }
        }

        // Act
        await render(InspectorMappingBlockComponent, { inputs: { block } })

        // Assert
        expect(screen.getByTestId("mapping-block-link-height").getAttribute("href")).toBe("https://docs.example.com")
    })
})
