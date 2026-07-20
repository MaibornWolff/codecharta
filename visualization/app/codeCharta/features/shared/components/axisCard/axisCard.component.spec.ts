import { render, screen } from "@testing-library/angular"
import { AxisCardComponent } from "./axisCard.component"

describe("AxisCardComponent", () => {
    it("should render the label", async () => {
        // Arrange & Act
        await render(AxisCardComponent, { inputs: { label: "Area" } })

        // Assert
        expect(screen.getByText("Area")).not.toBeNull()
    })

    it("should render an interactive search button targeting the search popover", async () => {
        // Arrange & Act
        const { container } = await render(AxisCardComponent, {
            inputs: { label: "Area", metricName: "rloc", searchPopoverId: "search-pop", searchAnchorName: "area-anchor" }
        })

        // Assert
        expect(container.querySelector("button[popovertarget='search-pop']")).not.toBeNull()
        expect(screen.getByText("rloc")).not.toBeNull()
    })

    it("should not set a popovertarget on the search button when disabled", async () => {
        // Arrange & Act
        const { container } = await render(AxisCardComponent, {
            inputs: { label: "Edges", metricName: "x", searchPopoverId: "search-pop", disabled: true }
        })

        // Assert
        expect(container.querySelector("button[popovertarget='search-pop']")).toBeNull()
        expect(container.querySelector("button[disabled]")).not.toBeNull()
    })

    it("should render a non-interactive body when no search popover is provided", async () => {
        // Arrange & Act
        const { container } = await render(AxisCardComponent, {
            inputs: { label: "Color", metricName: "Settings", hasCog: true, cogPopoverId: "cog-pop", cogAnchorName: "cog-anchor" }
        })

        // Assert: the cog is the only button; the body is a plain, non-interactive div
        const buttons = container.querySelectorAll("button")
        expect(buttons.length).toBe(1)
        expect(buttons[0].getAttribute("popovertarget")).toBe("cog-pop")
        expect(screen.getByText("Settings")).not.toBeNull()
    })

    it("should expose the test id on the card container", async () => {
        // Arrange & Act
        await render(AxisCardComponent, { inputs: { label: "Area", testId: "metric-segment-area" } })

        // Assert
        expect(screen.getByTestId("metric-segment-area")).not.toBeNull()
    })
})
