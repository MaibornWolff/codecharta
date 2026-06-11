import { fireEvent, render, screen } from "@testing-library/angular"
import { InlineColorPickerComponent } from "./inlineColorPicker.component"

describe("InlineColorPickerComponent", () => {
    async function setup() {
        const colorChangeSpy = jest.fn()
        const renderResult = await render(InlineColorPickerComponent, {
            inputs: { hexColor: "#ff0000", ariaLabel: "Recolor positive" },
            on: { colorChange: colorChangeSpy }
        })
        return { component: renderResult.fixture.componentInstance, container: renderResult.container, colorChangeSpy }
    }

    it("should open the color panel when clicking the swatch", async () => {
        // Arrange
        const { container } = await setup()

        // Act
        fireEvent.click(screen.getByRole("button", { name: "Recolor positive" }))

        // Assert
        expect(container.querySelector("color-chrome")).not.toBeNull()
    })

    it("should keep the panel inside the component so popovers are not light-dismissed", async () => {
        // Arrange
        const { container } = await setup()

        // Act
        fireEvent.click(screen.getByRole("button", { name: "Recolor positive" }))

        // Assert: the panel must be a descendant of the host, not an overlay on document.body
        expect(container.contains(document.querySelector("color-chrome"))).toBe(true)
    })

    it("should close the panel when clicking outside the component", async () => {
        // Arrange
        const { container } = await setup()
        fireEvent.click(screen.getByRole("button", { name: "Recolor positive" }))

        // Act
        fireEvent.click(document.body)

        // Assert
        expect(container.querySelector("color-chrome")).toBeNull()
    })

    it("should stay open when clicking inside the panel", async () => {
        // Arrange
        const { container } = await setup()
        fireEvent.click(screen.getByRole("button", { name: "Recolor positive" }))

        // Act
        fireEvent.click(container.querySelector("color-chrome"))

        // Assert
        expect(container.querySelector("color-chrome")).not.toBeNull()
    })

    it("should emit colorChange when a color is picked", async () => {
        // Arrange
        const { component, colorChangeSpy } = await setup()

        // Act
        component.handleChangeComplete("#123456")

        // Assert
        expect(colorChangeSpy).toHaveBeenCalledWith("#123456")
    })
})
