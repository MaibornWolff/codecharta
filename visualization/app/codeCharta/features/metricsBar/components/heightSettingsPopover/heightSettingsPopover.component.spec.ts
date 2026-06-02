import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { setInvertHeight } from "../../../../state/store/appSettings/invertHeight/invertHeight.actions"
import { invertHeightSelector } from "../../../../state/store/appSettings/invertHeight/invertHeight.selector"
import { setScaling } from "../../../../state/store/appSettings/scaling/scaling.actions"
import { scalingSelector } from "../../../../state/store/appSettings/scaling/scaling.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { HeightSettingsPopoverComponent } from "./heightSettingsPopover.component"

describe("HeightSettingsPopoverComponent", () => {
    async function setup(options: { scalingY?: number; invertHeight?: boolean; isDeltaState?: boolean } = {}) {
        const { scalingY = 1, invertHeight = false, isDeltaState = false } = options
        const renderResult = await render(HeightSettingsPopoverComponent, {
            inputs: {
                popoverId: "metric-settings-popover-height",
                anchorName: "metric-segment-height-cog"
            },
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: scalingSelector, value: { x: 1, y: scalingY, z: 1 } },
                        { selector: invertHeightSelector, value: invertHeight },
                        { selector: isDeltaStateSelector, value: isDeltaState }
                    ]
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

    function inputEvent(value: string): Event {
        return { target: { value } } as unknown as Event
    }

    function checkboxEvent(checked: boolean): Event {
        return { target: { checked } } as unknown as Event
    }

    it("should dispatch setScaling with the parsed y value after the debounce time elapses", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup({ scalingY: 1 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleScalingInput(inputEvent("10"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setScaling({ value: { y: 10 } }))
        jest.useRealTimers()
    })

    it("should clamp the scaling value to the maximum of 25 before dispatching", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup({ scalingY: 1 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleScalingInput(inputEvent("100"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setScaling({ value: { y: 25 } }))
        jest.useRealTimers()
    })

    it("should not dispatch setScaling when the value is unchanged", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup({ scalingY: 5 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleScalingInput(inputEvent("5"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setScaling({ value: { y: 5 } }))
        jest.useRealTimers()
    })

    it("should not dispatch setScaling when the parsed value is not a number", async () => {
        // Arrange
        jest.useFakeTimers()
        const { component } = await setup({ scalingY: 1 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleScalingInput(inputEvent("abc"))
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
        jest.useRealTimers()
    })

    it("should dispatch setInvertHeight with true when the checkbox is checked", async () => {
        // Arrange
        const { component } = await setup({ invertHeight: false })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.toggleInvertHeight(checkboxEvent(true))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setInvertHeight({ value: true }))
    })

    it("should dispatch setInvertHeight with false when the checkbox is unchecked", async () => {
        // Arrange
        const { component } = await setup({ invertHeight: true })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.toggleInvertHeight(checkboxEvent(false))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setInvertHeight({ value: false }))
    })

    it("should report delta state as active when in delta mode", async () => {
        // Arrange & Act
        const { component } = await setup({ isDeltaState: true })

        // Assert
        expect(component.isDeltaState()).toBe(true)
    })

    it("should report delta state as inactive outside delta mode", async () => {
        // Arrange & Act
        const { component } = await setup({ isDeltaState: false })

        // Assert
        expect(component.isDeltaState()).toBe(false)
    })
})
