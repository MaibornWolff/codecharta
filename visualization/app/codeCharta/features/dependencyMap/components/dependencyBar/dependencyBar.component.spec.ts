import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DEPENDENCY_EDGE_TYPES, DependencyEdgeType, DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { edgeMetricDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultDependencyGraphSettings, dependencyGraphSettingsSelector } from "../../../../stores/preferences/preferences.read.facade"
import { setDependencyGraphSettings } from "../../../../stores/preferences/preferences.write.facade"
import { setState } from "../../../../stores/rootStore/state.actions"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { unfocusAllNodes } from "../../../../stores/sharedView/sharedView.write.facade"
import { isDependencyMapFocusedSelector } from "../../selectors/dependencyMap.selectors"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyBarComponent } from "./dependencyBar.component"

const EDGE_METRICS = [
    { name: "dependencies", maxValue: 12, minValue: 1, values: [] },
    { name: "temporal_coupling", maxValue: 1, minValue: 0.1, values: [] }
]

async function renderBar({
    edgeMetric = "dependencies",
    settings = {},
    isFocused = false
}: {
    edgeMetric?: string
    settings?: Partial<DependencyGraphSettings>
    isFocused?: boolean
} = {}) {
    const rendered = await render(DependencyBarComponent, {
        providers: [
            { provide: State, useValue: { getValue: () => defaultState } },
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: edgeMetricSelector, value: edgeMetric },
                    { selector: edgeMetricDataSelector, value: EDGE_METRICS },
                    { selector: dependencyGraphSettingsSelector, value: { ...defaultDependencyGraphSettings, ...settings } },
                    { selector: isDependencyMapFocusedSelector, value: isFocused }
                ]
            })
        ]
    })
    return Object.assign(jest.spyOn(TestBed.inject(MockStore), "dispatch"), { fixture: rendered.fixture })
}

function changed(settings: Partial<DependencyGraphSettings>) {
    return setDependencyGraphSettings({ value: settings })
}

describe("DependencyBarComponent", () => {
    it("should name the edges shown, the edge style with its line thickness and the edge metric, in that order", async () => {
        // Act
        await renderBar()

        // Assert
        const segments = [...document.querySelectorAll("[data-testid$='-segment']")].map(segment => segment.getAttribute("data-testid"))
        expect(segments).toEqual([
            "dependency-bar-edges-segment",
            "dependency-bar-edge-style-segment",
            "dependency-bar-edge-metric-segment"
        ])
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("All")
        expect(screen.getByTestId("dependency-bar-edge-style-segment").textContent).toContain("Curved")
        expect(screen.getByTestId("dependency-bar-edge-thickness-value").textContent).toContain("By count")
        expect(screen.getByTestId("dependency-bar-edge-metric-segment").textContent).toContain("dependencies")
    })

    it("should explain the chosen edge style and line thickness", async () => {
        // Act
        await renderBar({ settings: { edgeStyle: "straight", edgeWidth: { thickness: "thin", factor: 1 } } })

        // Assert
        expect(screen.getByTestId("dependency-bar-edge-style-hint").textContent).toBe("A straight line from box to box")
        expect(screen.getByTestId("dependency-bar-edge-thickness-hint").textContent).toBe("Every edge a hairline, easiest to see through")
    })

    it("should reset the edge style and line thickness to their defaults", async () => {
        // Arrange
        const dispatch = await renderBar({ settings: { edgeStyle: "straight", isAnchoredAtSideMiddle: true } })

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Reset edge style" }))

        // Assert
        const { edgeStyle, isAnchoredAtSideMiddle, edgeWidth } = defaultDependencyGraphSettings
        expect(dispatch).toHaveBeenCalledWith(
            setState({ value: { preferences: { dependencyGraph: { edgeStyle, isAnchoredAtSideMiddle, edgeWidth } } } })
        )
    })

    it("should name the edge types shown when only some are", async () => {
        // Act
        await renderBar({ settings: { shownEdgeTypes: ["feedbackLeafLevel", "cyclic"] } })

        // Assert
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("In a cycle, Points upward and closes a cycle")
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edges-regular").checked).toBe(false)
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edges-cyclic").checked).toBe(true)
    })

    it("should stop showing an edge type the reader unticks", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edges-regular"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ shownEdgeTypes: ["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"] }))
    })

    it.each<[string, readonly DependencyEdgeType[]]>([
        ["None", []],
        ["All", DEPENDENCY_EDGE_TYPES],
        ["Invert", ["regular", "feedbackContainerLevel", "feedbackLeafLevel"]]
    ])("should show the edge types %s asks for", async (shortcut, expected) => {
        // Arrange
        const dispatch = await renderBar({ settings: { shownEdgeTypes: ["cyclic"] } })

        // Act
        await userEvent.click(screen.getByRole("button", { name: shortcut }))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ shownEdgeTypes: [...expected] }))
    })

    it("should draw the edges in the style the reader picks", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-style-straight"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ edgeStyle: "straight" }))
    })

    it("should draw the edges as thick as the reader picks", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-thickness-thin"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ edgeWidth: { thickness: "thin", factor: 1 } }))
    })

    it("should scale the edges' width by the factor the reader sets", async () => {
        // Arrange
        jest.useFakeTimers()
        const dispatch = await renderBar()
        const [factorInput] = screen.getAllByLabelText("Line width factor")

        // Act
        fireEvent.input(factorInput, { target: { value: "2.5" } })
        jest.runOnlyPendingTimers()
        jest.useRealTimers()

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ edgeWidth: { thickness: "byCount", factor: 2.5 } }))
    })

    it("should anchor the edges at the middle of the sides once the reader ticks it", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByLabelText("Start and end at the middle of the side"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ isAnchoredAtSideMiddle: true }))
    })

    it("should offer only the dependency toggle for another edge metric, and flip only it", async () => {
        // Arrange
        const dispatch = await renderBar({ edgeMetric: "temporal_coupling" })

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Invert" }))

        // Assert
        const disabledTypes = DEPENDENCY_EDGE_TYPES.filter(type =>
            screen.getByTestId(`dependency-bar-edges-${type}`).hasAttribute("disabled")
        )
        expect(disabledTypes).toEqual(["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"])
        expect(dispatch).toHaveBeenCalledWith(changed({ shownEdgeTypes: ["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"] }))
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("All")
    })

    it("should fit the whole graph into view once the reader asks for it", async () => {
        // Arrange
        await renderBar()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Show the whole graph" }))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).fitRequest()).toBe(1)
    })

    it("should offer to reset the layout only once a box was moved, and put it back", async () => {
        // Arrange
        const { fixture } = await renderBar()
        const viewStore = TestBed.inject(DependencyMapViewStore)
        const offeredBeforeMoving = screen.queryByTestId("dependency-reset-layout") !== null
        viewStore.placeBox("/root/a.ts", [10, 0])
        fixture.detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("dependency-reset-layout"))

        // Assert
        expect(offeredBeforeMoving).toBe(false)
        expect(viewStore.boxOffsets().size).toBe(0)
        expect(screen.queryByTestId("dependency-reset-layout")).toBeNull()
    })

    it("should offer to unfocus only while a folder is focused, and show every folder again", async () => {
        // Arrange
        const dispatch = await renderBar({ isFocused: true })

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-unfocus"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(unfocusAllNodes())
    })

    it("should not offer to unfocus while nothing is focused", async () => {
        // Act
        await renderBar()

        // Assert
        expect(screen.queryByTestId("dependency-bar-unfocus")).toBeNull()
    })
})
