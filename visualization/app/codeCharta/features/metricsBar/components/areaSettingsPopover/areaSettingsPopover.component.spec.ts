import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { setEnableFloorLabels } from "../../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { setInvertArea } from "../../../../state/store/appSettings/invertArea/invertArea.actions"
import { setMargin } from "../../../../state/store/dynamicSettings/margin/margin.actions"
import { marginSelector } from "../../../../state/store/dynamicSettings/margin/margin.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { AreaSettingsPopoverComponent } from "./areaSettingsPopover.component"

describe("AreaSettingsPopoverComponent", () => {
    async function setup(margin = 0) {
        const renderResult = await render(AreaSettingsPopoverComponent, {
            inputs: {
                popoverId: "metric-settings-popover-area",
                anchorName: "metric-segment-area-cog"
            },
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: marginSelector, value: margin }]
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
        return { component: renderResult.fixture.componentInstance }
    }

    function marginEvent(rawValue: string): Event {
        // Arrange a minimal input event whose target carries the typed value
        const input = document.createElement("input")
        input.value = rawValue
        return { target: input } as unknown as Event
    }

    it("should dispatch setMargin with the parsed value after the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleMarginInput(marginEvent("42"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setMargin({ value: 42 }))
        jest.useRealTimers()
    })

    it("should not dispatch setMargin before the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleMarginInput(marginEvent("42"))
        jest.advanceTimersByTime(399)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setMargin({ value: 42 }))
        jest.useRealTimers()
    })

    it("should debounce rapid margin inputs into a single dispatch using the latest value", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act
        component.handleMarginInput(marginEvent("10"))
        jest.advanceTimersByTime(100)
        component.handleMarginInput(marginEvent("25"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(setMargin({ value: 25 }))
        jest.useRealTimers()
    })

    it("should reject NaN input and not dispatch setMargin", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act
        component.handleMarginInput(marginEvent(""))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
        jest.useRealTimers()
    })

    it("should skip dispatching when the parsed margin equals the current margin", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup(50)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act
        component.handleMarginInput(marginEvent("50"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setMargin({ value: 50 }))
        jest.useRealTimers()
    })

    it("should dispatch setEnableFloorLabels with the checkbox checked state", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = true

        // Act
        component.setEnableFloorLabel({ target: checkbox } as unknown as Event)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setEnableFloorLabels({ value: true }))
    })

    it("should dispatch setInvertArea with the checkbox checked state", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = true

        // Act
        component.toggleInvertingArea({ target: checkbox } as unknown as Event)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setInvertArea({ value: true }))
    })
})
