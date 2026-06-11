import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { defaultState } from "../../../../state/store/state.manager"
import { ColorRangeSectionComponent } from "./colorRangeSection.component"

describe("ColorRangeSectionComponent", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    async function setup() {
        const renderResult = await render(ColorRangeSectionComponent, {
            providers: [provideMockStore({ initialState: defaultState }), { provide: State, useValue: { getValue: () => defaultState } }]
        })
        return { component: renderResult.fixture.componentInstance }
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
    })

    it("should flush a pending color range when destroyed before the debounce timer fires", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleValueChange({ newLeftValue: 5, newRightValue: 42 })
        component.ngOnDestroy()

        // Assert: the adjustment is committed instead of silently discarded
        expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: { from: 5, to: 42 } }))

        jest.advanceTimersByTime(400)
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
    })
})
