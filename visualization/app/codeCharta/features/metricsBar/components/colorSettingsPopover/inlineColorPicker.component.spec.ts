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

    function openPanel() {
        fireEvent.click(screen.getByRole("button", { name: "Recolor positive" }))
    }

    it("should open the color panel when clicking the swatch", async () => {
        // Arrange
        const { container } = await setup()

        // Act
        openPanel()

        // Assert
        expect(container.querySelector("color-chrome")).not.toBeNull()
    })

    it("should keep the panel inside the component so popovers are not light-dismissed", async () => {
        // Arrange
        const { container } = await setup()

        // Act
        openPanel()

        // Assert: the panel must be a descendant of the host, not an overlay on document.body
        expect(container.contains(document.querySelector("color-chrome"))).toBe(true)
    })

    it("should close the panel on pointerdown outside the component", async () => {
        // Arrange
        const { container } = await setup()
        openPanel()

        // Act
        fireEvent.pointerDown(document.body)

        // Assert
        expect(container.querySelector("color-chrome")).toBeNull()
    })

    it("should stay open on pointerdown inside the panel", async () => {
        // Arrange
        const { container } = await setup()
        openPanel()

        // Act
        fireEvent.pointerDown(container.querySelector("color-chrome"))

        // Assert
        expect(container.querySelector("color-chrome")).not.toBeNull()
    })

    it("should stay open when a drag started inside the panel is released outside", async () => {
        // Arrange
        const { container } = await setup()
        openPanel()

        // Act: pointerdown lands inside, the browser fires the click on a common ancestor
        fireEvent.pointerDown(container.querySelector("color-chrome"))
        fireEvent.click(document.body)

        // Assert
        expect(container.querySelector("color-chrome")).not.toBeNull()
    })

    it("should emit a pending color when the panel closes before the debounced change event fires", async () => {
        // Arrange
        const { component, colorChangeSpy } = await setup()
        openPanel()
        component.handleColorChanging("#abcdef")

        // Act
        fireEvent.pointerDown(document.body)

        // Assert
        expect(colorChangeSpy).toHaveBeenCalledWith("#abcdef")
    })

    it("should not re-emit an already completed color when the panel closes", async () => {
        // Arrange
        const { component, colorChangeSpy } = await setup()
        openPanel()
        component.handleColorChanging("#abcdef")
        component.handleChangeComplete("#abcdef")

        // Act
        fireEvent.pointerDown(document.body)

        // Assert
        expect(colorChangeSpy).toHaveBeenCalledTimes(1)
    })

    it("should close the panel when a surrounding container scrolls", async () => {
        // Arrange
        const { container } = await setup()
        openPanel()

        // Act: scroll does not bubble, but the capture-phase listener must catch it
        fireEvent.scroll(document.body)

        // Assert
        expect(container.querySelector("color-chrome")).toBeNull()
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
