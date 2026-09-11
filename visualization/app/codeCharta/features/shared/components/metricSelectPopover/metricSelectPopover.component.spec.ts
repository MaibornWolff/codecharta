import { fireEvent, render, screen } from "@testing-library/angular"
import { MetricOption } from "./metricOption"
import { MetricSelectPopoverComponent } from "./metricSelectPopover.component"

describe("MetricSelectPopoverComponent", () => {
    const options: MetricOption[] = [
        { name: "rloc", maxValue: 100 },
        { name: "mcc", maxValue: 50 },
        { name: "complexity", maxValue: 30 }
    ]

    async function setup(inputs: Record<string, unknown> = {}) {
        const renderResult = await render(MetricSelectPopoverComponent, {
            inputs: {
                popoverId: "metric-select-popover-area",
                anchorName: "metric-segment-area",
                options,
                ...inputs
            }
        })
        // the option list renders lazily, so simulate the popover opening
        const popoverElement = renderResult.container.querySelector("[popover]") as HTMLElement
        const toggleEvent = new Event("toggle")
        Object.assign(toggleEvent, { newState: "open" })
        popoverElement.dispatchEvent(toggleEvent)
        renderResult.fixture.detectChanges()
        return renderResult
    }

    it("should render every option with its highest value", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("rloc")).not.toBeNull()
        expect(screen.getByText("mcc")).not.toBeNull()
        expect(screen.getByText("(100)")).not.toBeNull()
    })

    it("should mark the selected metric", async () => {
        // Arrange & Act
        const { container } = await setup({ selected: "mcc" })

        // Assert
        expect(container.querySelector("[data-metric-name='mcc']")?.classList).toContain("font-semibold")
        expect(container.querySelector("[data-metric-name='rloc']")?.classList).not.toContain("font-semibold")
    })

    it("should filter the metric list by the search term", async () => {
        // Arrange
        const { container } = await setup()
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.input(searchInput, { target: { value: "rloc" } })

        // Assert
        expect(screen.getByText("rloc")).not.toBeNull()
        expect(screen.queryByText("mcc")).toBeNull()
    })

    it("should update the bound search term signal when typing", async () => {
        // Arrange
        const { fixture, container } = await setup()
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.input(searchInput, { target: { value: "compl" } })

        // Assert
        expect(fixture.componentInstance.searchTerm()).toBe("compl")
        expect(fixture.componentInstance.activeIndex()).toBe(0)
    })

    it("should show the empty placeholder when no metric matches the search term", async () => {
        // Arrange
        const { container } = await setup()
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.input(searchInput, { target: { value: "doesNotExist" } })

        // Assert
        expect(screen.getByText("No metrics found")).not.toBeNull()
    })

    it("should emit the selected metric name when an option is clicked", async () => {
        // Arrange
        const { fixture } = await setup()
        const emitted: string[] = []
        fixture.componentInstance.metricSelected.subscribe(name => emitted.push(name))

        // Act
        fireEvent.click(screen.getByText("mcc"))

        // Assert
        expect(emitted).toEqual(["mcc"])
    })

    it("should emit the active metric when Enter is pressed in the search field", async () => {
        // Arrange
        const { fixture, container } = await setup()
        const emitted: string[] = []
        fixture.componentInstance.metricSelected.subscribe(name => emitted.push(name))
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.keyDown(searchInput, { key: "ArrowDown" })
        fireEvent.keyDown(searchInput, { key: "Enter" })

        // Assert
        expect(emitted).toEqual(["mcc"])
    })
})
