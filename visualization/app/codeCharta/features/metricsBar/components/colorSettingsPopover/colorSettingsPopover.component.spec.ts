import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { invertColorRange, invertDeltaColors } from "../../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { ColorSettingsPopoverComponent } from "./colorSettingsPopover.component"

describe("ColorSettingsPopoverComponent", () => {
    async function setup(mapColors = defaultMapColors) {
        const renderResult = await render(ColorSettingsPopoverComponent, {
            inputs: {
                popoverId: "metric-settings-popover-color",
                anchorName: "metric-segment-color-cog"
            },
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: mapColorsSelector, value: mapColors }]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
        return { component: renderResult.fixture.componentInstance, fixture: renderResult.fixture }
    }

    it("should dispatch setColorRange with pending values after the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleValueChange({ newLeftValue: 5, newRightValue: 42 })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: { from: 5, to: 42 } }))
        jest.useRealTimers()
    })

    it("should debounce rapid changes into a single dispatch using the latest values", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleValueChange({ newLeftValue: 1, newRightValue: undefined })
        jest.advanceTimersByTime(100)
        component.handleValueChange({ newLeftValue: undefined, newRightValue: 9 })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: { from: 1, to: 9 } }))
        jest.useRealTimers()
    })

    it("should not dispatch setColorRange when destroyed before the debounce timer fires", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleValueChange({ newLeftValue: 5, newRightValue: 42 })
        component.ngOnDestroy()
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setColorRange({ value: { from: 5, to: 42 } }))
        jest.useRealTimers()
    })

    it("should report colors as not inverted for the default map colors", async () => {
        // Arrange & Act
        const { component } = await setup(defaultMapColors)

        // Assert
        expect(component.isColorRangeInverted()).toBe(false)
        expect(component.areDeltaColorsInverted()).toBe(false)
    })

    it("should report colors as inverted when positive and negative are swapped", async () => {
        // Arrange & Act
        const { component } = await setup({
            ...defaultMapColors,
            positive: defaultMapColors.negative,
            negative: defaultMapColors.positive
        })

        // Assert
        expect(component.isColorRangeInverted()).toBe(true)
    })

    it("should report delta colors as inverted when positiveDelta and negativeDelta are swapped", async () => {
        // Arrange & Act
        const { component } = await setup({
            ...defaultMapColors,
            positiveDelta: defaultMapColors.negativeDelta,
            negativeDelta: defaultMapColors.positiveDelta
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
})
