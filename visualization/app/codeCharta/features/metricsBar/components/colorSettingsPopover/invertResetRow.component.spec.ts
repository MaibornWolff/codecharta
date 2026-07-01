import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { defaultMapColors, invertColorRange, invertDeltaColors, mapColorsSelector } from "../../../../appearance/appearance.facade"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { InvertResetRowComponent } from "./invertResetRow.component"

describe("InvertResetRowComponent", () => {
    async function setup(mapColors = defaultMapColors, isDeltaState = false) {
        const renderResult = await render(InvertResetRowComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: mapColorsSelector, value: mapColors },
                        { selector: isDeltaStateSelector, value: isDeltaState }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should report colors as not inverted for the default map colors", async () => {
        // Arrange & Act
        const { component } = await setup(defaultMapColors)

        // Assert
        expect(component.isColorRangeInverted()).toBe(false)
        expect(component.areDeltaColorsInverted()).toBe(false)
    })

    it("should report colors as inverted based on the explicit inversion flag", async () => {
        // Arrange & Act
        const { component } = await setup({
            ...defaultMapColors,
            positive: defaultMapColors.negative,
            negative: defaultMapColors.positive,
            isColorRangeInverted: true
        })

        // Assert
        expect(component.isColorRangeInverted()).toBe(true)
    })

    it("should keep reporting inversion when individual colors were customized afterwards", async () => {
        // Arrange & Act
        const { component } = await setup({
            ...defaultMapColors,
            positive: "#123456",
            isColorRangeInverted: true
        })

        // Assert: the checkbox must not desync once a color is customized
        expect(component.isColorRangeInverted()).toBe(true)
    })

    it("should report delta colors as inverted based on the explicit inversion flag", async () => {
        // Arrange & Act
        const { component } = await setup({
            ...defaultMapColors,
            positiveDelta: defaultMapColors.negativeDelta,
            negativeDelta: defaultMapColors.positiveDelta,
            areDeltaColorsInverted: true
        })

        // Assert
        expect(component.areDeltaColorsInverted()).toBe(true)
    })

    it("should dispatch invertColorRange and invertDeltaColors from the toggle handlers", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleIsColorRangeInvertedChange()
        component.handleAreDeltaColorsInvertedChange()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(invertColorRange())
        expect(dispatchSpy).toHaveBeenCalledWith(invertDeltaColors())
    })

    it("should reset the gradient mode together with the colors outside delta mode", async () => {
        // Arrange & Act
        const { component } = await setup()

        // Assert
        expect(component.resetColorsKeys()).toContain("dynamicSettings.colorMode")
    })

    it("should not reset the gradient mode in delta mode where it is not configurable", async () => {
        // Arrange & Act
        const { component } = await setup(defaultMapColors, true)

        // Assert
        expect(component.resetColorsKeys()).not.toContain("dynamicSettings.colorMode")
    })
})
