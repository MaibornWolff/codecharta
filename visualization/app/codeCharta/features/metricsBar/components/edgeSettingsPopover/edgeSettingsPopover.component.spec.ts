import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../../../state/selectors/amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
import {
    amountOfEdgePreviewsSelector,
    edgeHeightSelector,
    setAmountOfEdgePreviews,
    setEdgeHeight,
    setShowIncomingEdges,
    setShowOnlyBuildingsWithEdges,
    setShowOutgoingEdges,
    showIncomingEdgesSelector,
    showOnlyBuildingsWithEdgesSelector,
    showOutgoingEdgesSelector
} from "../../../../mapState/mapState.facade"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { EdgeSettingsPopoverComponent } from "./edgeSettingsPopover.component"

describe("EdgeSettingsPopoverComponent", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    async function setup(
        overrides: {
            amountOfBuildings?: number
            amountOfEdgePreviews?: number
            edgeHeight?: number
            showOutgoing?: boolean
            showIncoming?: boolean
            showOnlyBuildingsWithEdges?: boolean
        } = {}
    ) {
        const {
            amountOfBuildings = 10,
            amountOfEdgePreviews = 3,
            edgeHeight = 1,
            showOutgoing = false,
            showIncoming = false,
            showOnlyBuildingsWithEdges = false
        } = overrides

        return render(EdgeSettingsPopoverComponent, {
            inputs: { popoverId: "edge-popover", anchorName: "edge-anchor" },
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: amountOfBuildingsWithSelectedEdgeMetricSelector, value: amountOfBuildings },
                        { selector: amountOfEdgePreviewsSelector, value: amountOfEdgePreviews },
                        { selector: edgeHeightSelector, value: edgeHeight },
                        { selector: showOutgoingEdgesSelector, value: showOutgoing },
                        { selector: showIncomingEdgesSelector, value: showIncoming },
                        { selector: showOnlyBuildingsWithEdgesSelector, value: showOnlyBuildingsWithEdges }
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
    }

    it("should compute the edge preview label from the amount of buildings", async () => {
        // Arrange & Act
        const { fixture } = await setup({ amountOfBuildings: 42 })

        // Assert
        expect(fixture.componentInstance.edgePreviewLabel()).toBe(
            "Preview the edges of up to 42 buildings with the highest amount of incoming and outgoing edges"
        )
    })

    it("should dispatch setAmountOfEdgePreviews when the preview value changes", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ amountOfBuildings: 10, amountOfEdgePreviews: 3 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const previewNumberInput = screen.getAllByRole("spinbutton")[0]

        // Act
        fireEvent.input(previewNumberInput, { target: { value: "5" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setAmountOfEdgePreviews({ value: 5 }))
    })

    it("should not dispatch setAmountOfEdgePreviews when the value is unchanged", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ amountOfBuildings: 10, amountOfEdgePreviews: 3 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const previewNumberInput = screen.getAllByRole("spinbutton")[0]

        // Act
        fireEvent.input(previewNumberInput, { target: { value: "3" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it("should clamp and dispatch setAmountOfEdgePreviews to the amount of buildings when above the max", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ amountOfBuildings: 10, amountOfEdgePreviews: 3 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const previewNumberInput = screen.getAllByRole("spinbutton")[0]

        // Act
        fireEvent.input(previewNumberInput, { target: { value: "99" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setAmountOfEdgePreviews({ value: 10 }))
    })

    it("should dispatch setAmountOfEdgePreviews from the preview range slider", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ amountOfBuildings: 10, amountOfEdgePreviews: 3 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const previewRange = screen.getAllByRole("slider")[0]

        // Act
        fireEvent.input(previewRange, { target: { value: "6" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setAmountOfEdgePreviews({ value: 6 }))
    })

    it("should not dispatch setEdgeHeight when the value is unchanged", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ edgeHeight: 4 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const heightNumberInput = screen.getAllByRole("spinbutton")[1]

        // Act
        fireEvent.input(heightNumberInput, { target: { value: "4" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it("should dispatch setShowOutgoingEdges with false when toggled off", async () => {
        // Arrange
        await setup({ showOutgoing: true })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkboxes = screen.getAllByRole("checkbox")

        // Act
        fireEvent.click(checkboxes[0])

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setShowOutgoingEdges({ value: false }))
    })

    it("should dispatch setEdgeHeight when the height value changes", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ edgeHeight: 1 })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const heightNumberInput = screen.getAllByRole("spinbutton")[1]

        // Act
        fireEvent.input(heightNumberInput, { target: { value: "4" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setEdgeHeight({ value: 4 }))
    })

    it("should dispatch setShowOutgoingEdges when the outgoing checkbox is toggled", async () => {
        // Arrange
        await setup({ showOutgoing: false })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkboxes = screen.getAllByRole("checkbox")

        // Act
        fireEvent.click(checkboxes[0])

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setShowOutgoingEdges({ value: true }))
    })

    it("should dispatch setShowIncomingEdges when the incoming checkbox is toggled", async () => {
        // Arrange
        await setup({ showIncoming: false })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkboxes = screen.getAllByRole("checkbox")

        // Act
        fireEvent.click(checkboxes[1])

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setShowIncomingEdges({ value: true }))
    })

    it("should dispatch setShowOnlyBuildingsWithEdges when its checkbox is toggled", async () => {
        // Arrange
        await setup({ amountOfBuildings: 10, showOnlyBuildingsWithEdges: false })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const checkboxes = screen.getAllByRole("checkbox")

        // Act
        fireEvent.click(checkboxes[2])

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setShowOnlyBuildingsWithEdges({ value: true }))
    })
})
