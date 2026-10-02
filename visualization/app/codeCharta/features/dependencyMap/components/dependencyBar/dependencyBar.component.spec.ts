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
import { DependencyBarComponent } from "./dependencyBar.component"

const EDGE_METRICS = [
    { name: "dependencies", maxValue: 12, minValue: 1, values: [] },
    { name: "temporal_coupling", maxValue: 1, minValue: 0.1, values: [] }
]

async function renderBar({
    edgeMetric = "dependencies",
    settings = {}
}: {
    edgeMetric?: string
    settings?: Partial<DependencyGraphSettings>
} = {}) {
    const rendered = await render(DependencyBarComponent, {
        providers: [
            { provide: State, useValue: { getValue: () => defaultState } },
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: edgeMetricSelector, value: edgeMetric },
                    { selector: edgeMetricDataSelector, value: EDGE_METRICS },
                    { selector: dependencyGraphSettingsSelector, value: { ...defaultDependencyGraphSettings, ...settings } }
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
    it("should name the edges shown, the edge style with its line thickness, the edge metric and the level labels, in that order", async () => {
        // Act
        await renderBar()

        // Assert
        const segments = [...document.querySelectorAll("[data-testid$='-segment']")].map(segment => segment.getAttribute("data-testid"))
        expect(segments).toEqual([
            "dependency-bar-edges-segment",
            "dependency-bar-edge-style-segment",
            "dependency-bar-edge-metric-segment",
            "dependency-bar-level-label-segment"
        ])
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("All")
        expect(screen.getByTestId("dependency-bar-edge-style-segment").textContent).toContain("Curved")
        expect(screen.getByTestId("dependency-bar-edge-thickness-value").textContent).toContain("By count")
        expect(screen.getByTestId("dependency-bar-edge-metric-segment").textContent).toContain("dependencies")
        expect(screen.getByTestId("dependency-bar-level-label-segment").textContent).toContain("Number")
    })

    it("should describe every edge style, mark the chosen one and explain the chosen line thickness", async () => {
        // Act
        await renderBar({ settings: { edgeStyle: "straight", edgeWidth: { thickness: "thin", factor: 1 } } })

        // Assert
        expect(screen.getByTestId("dependency-bar-edge-style-title").textContent).toBe("Straight")
        expect(screen.getByTestId("dependency-bar-edge-style-straight").textContent).toContain("A straight line from box to box")
        expect(screen.getByTestId("dependency-bar-edge-style-straight").querySelector("input").checked).toBe(true)
        expect(screen.getByTestId("dependency-bar-edge-style-curved").querySelector("input").checked).toBe(false)
        expect(screen.getByTestId("dependency-bar-edge-thickness-hint").textContent).toBe("Every edge a hairline, easiest to see through")
    })

    it("should open the edge styles from the card's name and the edge style settings from its cog", async () => {
        // Act
        await renderBar()

        // Assert
        const card = screen.getByTestId("dependency-bar-edge-style-segment")
        const nameButton = card.querySelector("button[popovertarget]:not([data-testid])")
        expect(nameButton.getAttribute("popovertarget")).toBe(screen.getByTestId("dependency-bar-edge-style-popover").id)
        expect(screen.getByTestId("dependency-bar-edge-style-cog").getAttribute("popovertarget")).toBe(
            screen.getByTestId("dependency-bar-edge-style-settings-popover").id
        )
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

    it("should not let the reader anchor the edges at the middle of the sides for Spread, and show a remembered tick as off", async () => {
        // Act
        await renderBar({ settings: { edgeStyle: "spread", isAnchoredAtSideMiddle: true } })

        // Assert
        const checkbox = screen.getByTestId<HTMLInputElement>("dependency-bar-edge-style-side-middle")
        expect(checkbox.disabled).toBe(true)
        expect(checkbox.checked).toBe(false)
        expect(screen.getByTestId("dependency-bar-edge-style-side-middle-note").textContent).toContain("Not for Spread")
    })

    it("should label the levels by their path once the reader picks it", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-level-label-path"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ levelLabel: "path" }))
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

    it("should carry the graph view tools in the tab on its edge", async () => {
        // Act
        const { fixture } = await renderBar()

        // Assert
        expect(fixture.nativeElement.querySelector("cc-bar-tools-tab cc-graph-view-tools")).not.toBeNull()
    })
})
