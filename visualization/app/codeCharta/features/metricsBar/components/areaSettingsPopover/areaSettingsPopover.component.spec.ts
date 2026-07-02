import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { setEnableFloorLabels, setInvertArea } from "../../../../mapState/mapState.facade"
import { setMargin } from "../../../../state/store/dynamicSettings/margin/margin.actions"
import { marginSelector } from "../../../../state/store/dynamicSettings/margin/margin.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { AreaSettingsPopoverComponent } from "./areaSettingsPopover.component"

describe("AreaSettingsPopoverComponent", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

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
        const marginNumberInput = screen.getByRole("spinbutton") as HTMLInputElement
        return { component: renderResult.fixture.componentInstance, marginNumberInput }
    }

    it("should dispatch setMargin with the typed value after the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { marginNumberInput } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.input(marginNumberInput, { target: { value: "42" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setMargin({ value: 42 }))
    })

    it("should not dispatch setMargin before the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { marginNumberInput } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.input(marginNumberInput, { target: { value: "42" } })
        jest.advanceTimersByTime(399)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setMargin({ value: 42 }))
    })

    it("should debounce rapid margin inputs into a single dispatch using the latest value", async () => {
        // Arrange
        jest.useFakeTimers()
        const { marginNumberInput } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act
        fireEvent.input(marginNumberInput, { target: { value: "10" } })
        jest.advanceTimersByTime(100)
        fireEvent.input(marginNumberInput, { target: { value: "25" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(setMargin({ value: 25 }))
    })

    it("should reject NaN input and not dispatch setMargin", async () => {
        // Arrange
        jest.useFakeTimers()
        const { marginNumberInput } = await setup(0)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act
        fireEvent.input(marginNumberInput, { target: { value: "" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it("should skip dispatching when the typed margin equals the current margin", async () => {
        // Arrange
        jest.useFakeTimers()
        const { marginNumberInput } = await setup(50)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act
        fireEvent.input(marginNumberInput, { target: { value: "50" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setMargin({ value: 50 }))
    })

    it("should not commit a stale intermediate value when retyping the current margin", async () => {
        // Arrange
        jest.useFakeTimers()
        const { marginNumberInput } = await setup(50)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        dispatchSpy.mockClear()

        // Act: retyping "50" passes through the intermediate "5"
        fireEvent.input(marginNumberInput, { target: { value: "5" } })
        fireEvent.input(marginNumberInput, { target: { value: "50" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setMargin({ value: 5 }))
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
