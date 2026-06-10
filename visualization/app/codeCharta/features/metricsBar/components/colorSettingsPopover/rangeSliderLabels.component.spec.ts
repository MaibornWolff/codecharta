import { render, screen } from "@testing-library/angular"
import { RangeSliderLabelsComponent } from "./rangeSliderLabels.component"
import { SliderRangePosition } from "./utils/SliderRangePosition"

describe("RangeSliderLabelsComponent", () => {
    async function setup(overrides: Partial<RangeSliderLabelsComponent> = {}) {
        const inputs = {
            minValue: 0,
            maxValue: 100,
            leftValueLabel: 20,
            rightValueLabel: 80,
            sliderWidth: 200,
            sliderRangePosition: { leftEnd: 40, rightStart: 160 } as SliderRangePosition,
            ...overrides
        }
        return render(RangeSliderLabelsComponent, { inputs })
    }

    it("should render the min, max and current value labels", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("0")).not.toBeNull()
        expect(screen.getByText("100")).not.toBeNull()
        expect(screen.getByText("20")).not.toBeNull()
        expect(screen.getByText("80")).not.toBeNull()
    })

    it("should render the combined left-right label text", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("20 - 80")).not.toBeNull()
    })

    it("should position the current left/right labels based on the slider range position", async () => {
        // Arrange
        // Act
        // jsdom reports element widths as 0, so positions equal the range ends
        const { fixture } = await setup({ sliderRangePosition: { leftEnd: 40, rightStart: 160 } })
        const component = fixture.componentInstance

        // Assert
        expect(component.currentLeftLabelLeftPosition).toBe(40)
        expect(component.currentRightLabelLeftPosition).toBe(160)
    })

    it("should hide the min label when the left thumb is close to the slider start", async () => {
        // Arrange & Act
        const { fixture } = await setup({ sliderRangePosition: { leftEnd: 2, rightStart: 160 } })
        const component = fixture.componentInstance

        // Assert
        expect(component.hideMinLabel).toBe(true)
    })

    it("should show the min label when the left thumb is far from the slider start", async () => {
        // Arrange & Act
        const { fixture } = await setup({ sliderRangePosition: { leftEnd: 60, rightStart: 160 } })
        const component = fixture.componentInstance

        // Assert
        expect(component.hideMinLabel).toBe(false)
    })

    it("should hide the max label when the right thumb is close to the slider end", async () => {
        // Arrange & Act
        const { fixture } = await setup({ sliderWidth: 200, sliderRangePosition: { leftEnd: 40, rightStart: 198 } })
        const component = fixture.componentInstance

        // Assert
        expect(component.hideMaxLabel).toBe(true)
    })

    it("should flag overlap and position the combined label between the thumbs when labels are close", async () => {
        // Arrange & Act
        const { fixture } = await setup({ sliderRangePosition: { leftEnd: 100, rightStart: 102 } })
        const component = fixture.componentInstance

        // Assert
        expect(component.doLeftRightLabelOverlap).toBe(true)
        expect(component.combinedCurrentLeftRightLabelLeftPosition).toBe(101)
    })

    it("should not flag overlap when the thumbs are far apart", async () => {
        // Arrange & Act
        const { fixture } = await setup({ sliderRangePosition: { leftEnd: 40, rightStart: 160 } })
        const component = fixture.componentInstance

        // Assert
        expect(component.doLeftRightLabelOverlap).toBe(false)
    })
})
