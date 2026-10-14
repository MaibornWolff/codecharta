import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { hasDeclarationsSelector, hasPackagesSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { DEPENDENCY_EDGE_TYPES, DependencyEdgeType, DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { edgeMetricDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultDependencyGraphSettings, dependencyGraphSettingsSelector } from "../../../../stores/preferences/preferences.read.facade"
import { setDependencyGraphSettings } from "../../../../stores/preferences/preferences.write.facade"
import { setState } from "../../../../stores/rootStore/state.actions"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { reportResize, stubElementSize, stubResizeObserver } from "../../../../util/testUtils/domStubs"
import { dependencyLayoutIdentitySelector, dependencyLoadedFilesIdentitySelector } from "../../selectors/dependencyMap.selectors"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyBarComponent } from "./dependencyBar.component"

const EDGE_METRICS = [
    { name: "dependencies", maxValue: 12, minValue: 1, values: [] },
    { name: "temporal_coupling", maxValue: 1, minValue: 0.1, values: [] }
]

async function renderBar({
    edgeMetric = "dependencies",
    settings = {},
    hasDeclarations = false,
    hasPackages = false
}: {
    edgeMetric?: string
    settings?: Partial<DependencyGraphSettings>
    hasDeclarations?: boolean
    hasPackages?: boolean
} = {}) {
    const rendered = await render(DependencyBarComponent, {
        providers: [
            { provide: State, useValue: { getValue: () => defaultState } },
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: edgeMetricSelector, value: edgeMetric },
                    { selector: edgeMetricDataSelector, value: EDGE_METRICS },
                    { selector: hasDeclarationsSelector, value: hasDeclarations },
                    { selector: hasPackagesSelector, value: hasPackages },
                    { selector: dependencyLayoutIdentitySelector, value: "project" },
                    { selector: dependencyLoadedFilesIdentitySelector, value: "project" },
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
    beforeEach(() => {
        stubResizeObserver()
    })

    it("should tell the graph how much of its bottom the bar covers, gap included, and nothing once the bar is gone", async () => {
        // Arrange
        const restoreElementSize = stubElementSize(() => ({ width: 900, height: 56 }))
        const { fixture } = await renderBar()
        const coveredBottom = TestBed.inject(DependencyMapViewStore).coveredBottom

        // Act
        reportResize()
        fixture.detectChanges()
        const whileShown = coveredBottom()
        fixture.destroy()
        restoreElementSize()

        // Assert
        expect([whileShown, coveredBottom()]).toEqual([68, 0])
    })

    it("should name the edges shown, the edge style with its line thickness, the edge metric and the level labels, in that order", async () => {
        // Arrange
        await renderBar()

        // Act
        const segments = [...document.querySelectorAll("[data-testid$='-segment']")].map(segment => segment.getAttribute("data-testid"))

        // Assert
        expect(segments).toEqual([
            "dependency-bar-edges-segment",
            "dependency-bar-edge-style-segment",
            "dependency-bar-edge-metric-segment"
        ])
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain(
            "In a cycle, Points upward, Points upward and closes a cycle"
        )
        expect(screen.getByTestId("dependency-bar-edge-style-segment").textContent).toContain("Combined")
        expect(screen.getByTestId("dependency-bar-edge-thickness-value").textContent).toContain("By count")
        expect(screen.getByTestId("dependency-bar-edge-metric-segment").textContent).toContain("dependencies")
    })

    it("should describe every edge style, mark the chosen one and explain the chosen line thickness", async () => {
        // Arrange
        const settings = { edgeStyle: "spread", edgeShape: "straight", edgeWidth: { thickness: "thin", factor: 1 } } as const

        // Act
        await renderBar({ settings })

        // Assert
        expect(screen.getByTestId("dependency-bar-edge-style-title").textContent).toBe("Spread")
        expect(screen.getByTestId("dependency-bar-edge-style-spread").textContent).toContain("Each edge with its own spot on the box")
        expect(screen.getByTestId("dependency-bar-edge-style-spread").querySelector("input").checked).toBe(true)
        expect(screen.getByTestId("dependency-bar-edge-style-combined").querySelector("input").checked).toBe(false)
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edge-shape-straight").checked).toBe(true)
        expect(screen.getByTestId("dependency-bar-edge-shape-hint").textContent).toBe("A straight line from box to box")
        expect(screen.getByTestId("dependency-bar-edge-thickness-hint").textContent).toBe("Every edge a hairline, easiest to see through")
    })

    it("should open one window from the edge style card, holding the edge styles and every setting of the lines", async () => {
        // Arrange
        await renderBar()

        // Act
        const card = screen.getByTestId("dependency-bar-edge-style-segment")
        const openers = [...card.querySelectorAll("button[popovertarget]")]
        const popover = screen.getByTestId("dependency-bar-edge-style-popover")

        // Assert
        expect(openers.map(opener => opener.getAttribute("popovertarget"))).toEqual([popover.id])
        expect(popover.contains(screen.getByTestId("dependency-bar-edge-style-combined"))).toBe(true)
        expect(popover.contains(screen.getByTestId("dependency-bar-edge-thickness-byCount"))).toBe(true)
        expect(screen.getAllByLabelText("Line width factor").every(input => popover.contains(input))).toBe(true)
        expect(popover.contains(screen.getByTestId("dependency-bar-line-style-shows-edgeType"))).toBe(true)
        expect(popover.contains(screen.getByRole("button", { name: "Reset edge style" }))).toBe(true)
    })

    it("should reset the edge style and line thickness to their defaults", async () => {
        // Arrange
        const dispatch = await renderBar({ settings: { edgeStyle: "spread", edgeShape: "straight", isAnchoredAtSideMiddle: true } })

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Reset edge style" }))

        // Assert
        const { edgeStyle, edgeShape, isAnchoredAtSideMiddle, edgeWidth, lineStyleShows } = defaultDependencyGraphSettings
        expect(dispatch).toHaveBeenCalledWith(
            setState({
                value: { preferences: { dependencyGraph: { edgeStyle, edgeShape, isAnchoredAtSideMiddle, edgeWidth, lineStyleShows } } }
            })
        )
    })

    it("should name the edge types shown when only some are", async () => {
        // Arrange
        const settings: Partial<DependencyGraphSettings> = { shownEdgeTypes: ["feedbackLeafLevel", "cyclic"] }

        // Act
        await renderBar({ settings })

        // Assert
        expect(screen.getByTestId("dependency-bar-edges-segment").textContent).toContain("In a cycle, Points upward and closes a cycle")
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edges-regular").checked).toBe(false)
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edges-cyclic").checked).toBe(true)
    })

    it("should show the edge types of the defaults again on reset", async () => {
        // Arrange
        const dispatch = await renderBar({ settings: { shownEdgeTypes: [...DEPENDENCY_EDGE_TYPES] } })

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Reset edges shown" }))

        // Assert
        const { shownEdgeTypes, isHoverLimitedToShownEdgeTypes } = defaultDependencyGraphSettings
        expect(shownEdgeTypes).not.toContain("regular")
        expect(dispatch).toHaveBeenCalledWith(
            setState({ value: { preferences: { dependencyGraph: { shownEdgeTypes, isHoverLimitedToShownEdgeTypes } } } })
        )
    })

    it("should hold the hover to the ticked edge types once the reader asks for it, and say what the hover shows", async () => {
        // Arrange
        const dispatch = await renderBar()
        const noteBefore = screen.getByTestId("dependency-bar-edges-hover-note").textContent

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edges-respect-on-hover"))

        // Assert
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edges-respect-on-hover").labels[0].textContent).toContain(
            "Respect on hover"
        )
        expect(noteBefore).toContain("shows all of its edges")
        expect(dispatch).toHaveBeenCalledWith(changed({ isHoverLimitedToShownEdgeTypes: true }))
    })

    it("should say that the hover shows only the ticked types while it is held to them", async () => {
        // Arrange
        const settings = { isHoverLimitedToShownEdgeTypes: true }

        // Act
        await renderBar({ settings })

        // Assert
        expect(screen.getByTestId<HTMLInputElement>("dependency-bar-edges-respect-on-hover").checked).toBe(true)
        expect(screen.getByTestId("dependency-bar-edges-hover-note").textContent).toContain("only its edges of the ticked types")
    })

    it("should stop showing an edge type the reader unticks", async () => {
        // Arrange
        const dispatch = await renderBar({ settings: { shownEdgeTypes: [...DEPENDENCY_EDGE_TYPES] } })

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
        await userEvent.click(screen.getByTestId("dependency-bar-edge-style-aside"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ edgeStyle: "aside" }))
    })

    it("should draw the edges in the line shape the reader picks", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-edge-shape-straight"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ edgeShape: "straight" }))
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

    it("should offer the line shape but not the middle of the sides for Spread, which gives each edge its own spot", async () => {
        // Arrange
        const settings = { edgeStyle: "spread", isAnchoredAtSideMiddle: true } as const

        // Act
        await renderBar({ settings })

        // Assert
        expect(screen.queryByTestId("dependency-bar-edge-shape-straight")).not.toBeNull()
        expect(screen.queryByTestId("dependency-bar-edge-style-side-middle")).toBeNull()
    })

    it("should offer neither the line shape nor the middle of the sides for Aside, whose edges always bow", async () => {
        // Arrange
        const settings = { edgeStyle: "aside", edgeShape: "straight" } as const

        // Act
        await renderBar({ settings })

        // Assert
        expect(screen.queryByTestId("dependency-bar-edge-shape-straight")).toBeNull()
        expect(screen.queryByTestId("dependency-bar-edge-style-side-middle")).toBeNull()
    })

    it("should offer only the dependency toggle for another edge metric, and flip only it", async () => {
        // Arrange
        const dispatch = await renderBar({ edgeMetric: "temporal_coupling", settings: { shownEdgeTypes: [...DEPENDENCY_EDGE_TYPES] } })

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
        // Arrange
        const { fixture } = await renderBar()

        // Act
        const viewTools = fixture.nativeElement.querySelector("cc-bar-tools-tab cc-graph-view-tools")

        // Assert
        expect(viewTools).not.toBeNull()
    })

    it("should offer the badges only for a map that tells its declarations, as All while every badge is shown", async () => {
        // Arrange
        const { fixture } = await renderBar()
        const cardWithoutDeclarations = screen.queryByTestId("dependency-bar-box-badges-segment")

        // Act
        TestBed.inject(MockStore).overrideSelector(hasDeclarationsSelector, true)
        TestBed.inject(MockStore).refreshState()
        fixture.detectChanges()

        // Assert
        expect(cardWithoutDeclarations).toBeNull()
        expect(screen.getByTestId("dependency-bar-box-badges-segment").textContent).toContain("All")
    })

    it("should name the shown badges, or None once the reader shows none", async () => {
        // Arrange
        await renderBar({ hasDeclarations: true, settings: { shownBoxBadges: ["insideFiles", "declaration"] } })
        const someShown = screen.getByTestId("dependency-bar-box-badges-segment").textContent

        // Act
        TestBed.resetTestingModule()
        await renderBar({ hasDeclarations: true, settings: { shownBoxBadges: [] } })

        // Assert
        expect(someShown).toContain("Cycles inside a file, Declaration in a cycle")
        expect(screen.getByTestId("dependency-bar-box-badges-segment").textContent).toContain("None")
    })

    it("should show on the card the samples of the shown badges in their order, named on hover", async () => {
        // Arrange & Act
        await renderBar({ hasDeclarations: true, settings: { shownBoxBadges: ["upward", "betweenFiles"] } })

        // Assert
        const shown = screen.getByTestId("dependency-bar-box-badges-shown")
        expect([...shown.querySelectorAll("svg")].map(sample => sample.getAttribute("data-mark"))).toEqual(["betweenFiles", "upward"])
        expect(shown.getAttribute("title")).toBe("Cycles between files, Upward dependencies inside")
    })

    it("should show on the card the lines of the shown edge types as the graph draws them, or None", async () => {
        // Arrange
        await renderBar({ settings: { shownEdgeTypes: ["regular", "feedbackContainerLevel"] } })
        const lines = [...screen.getByTestId("dependency-bar-edges-shown").querySelectorAll("line")]

        // Act
        TestBed.resetTestingModule()
        await renderBar({ settings: { shownEdgeTypes: [] } })

        // Assert
        const { regular, feedbackContainerLevel } = defaultDependencyGraphSettings.edgeColors
        expect(lines.map(line => [line.getAttribute("stroke"), line.getAttribute("stroke-dasharray")])).toEqual([
            [regular, null],
            [feedbackContainerLevel, "5 4"]
        ])
        expect(screen.getByTestId("dependency-bar-edges-shown").querySelector("line")).toBeNull()
        expect(screen.getByTestId("dependency-bar-edges-shown").textContent).toContain("None")
    })

    it("should let the dashes and arrowheads show the kind of use once the reader picks it", async () => {
        // Arrange
        const dispatch = await renderBar()

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-line-style-shows-usage"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ lineStyleShows: "usage" }))
    })

    it("should recolour an edge type and put the colours back on reset", async () => {
        // Arrange
        const dispatch = await renderBar({ settings: { edgeColors: { ...defaultDependencyGraphSettings.edgeColors, cyclic: "#000000" } } })
        const picker = dispatch.fixture.debugElement.query(By.css("[data-testid='dependency-bar-edge-color-regular']"))

        // Act
        picker.triggerEventHandler("colorChange", "#abcdef")
        await userEvent.click(screen.getByRole("button", { name: "Reset colours" }))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(
            changed({ edgeColors: { ...defaultDependencyGraphSettings.edgeColors, cyclic: "#000000", regular: "#abcdef" } })
        )
        expect(dispatch).toHaveBeenCalledWith(
            setState({ value: { preferences: { dependencyGraph: { edgeColors: defaultDependencyGraphSettings.edgeColors } } } })
        )
    })

    it("should hide a badge once the reader unticks it, and show it again once ticked", async () => {
        // Arrange
        const dispatch = await renderBar({ hasDeclarations: true, settings: { shownBoxBadges: ["betweenFiles", "upward"] } })

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-box-badges-betweenFiles"))
        await userEvent.click(screen.getByTestId("dependency-bar-box-badges-declaration"))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ shownBoxBadges: ["upward"] }))
        expect(dispatch).toHaveBeenCalledWith(changed({ shownBoxBadges: ["betweenFiles", "declaration", "upward"] }))
    })

    it("should show every badge, none or the others with the shortcuts, and every badge again on reset", async () => {
        // Arrange
        const dispatch = await renderBar({ hasDeclarations: true, settings: { shownBoxBadges: ["insideFiles"] } })
        const popover = within(screen.getByRole("dialog", { name: "Badges", hidden: true }))

        // Act
        await userEvent.click(popover.getByRole("button", { name: "All", hidden: true }))
        await userEvent.click(popover.getByRole("button", { name: "None", hidden: true }))
        await userEvent.click(popover.getByRole("button", { name: "Invert", hidden: true }))
        await userEvent.click(popover.getByRole("button", { name: "Reset badges", hidden: true }))

        // Assert
        expect(dispatch).toHaveBeenCalledWith(changed({ shownBoxBadges: ["betweenFiles", "insideFiles", "declaration", "upward"] }))
        expect(dispatch).toHaveBeenCalledWith(changed({ shownBoxBadges: [] }))
        expect(dispatch).toHaveBeenCalledWith(changed({ shownBoxBadges: ["betweenFiles", "declaration", "upward"] }))
        expect(dispatch).toHaveBeenCalledWith(
            setState({ value: { preferences: { dependencyGraph: { shownBoxBadges: defaultDependencyGraphSettings.shownBoxBadges } } } })
        )
    })

    it("should offer the hierarchy only for a map with packages, and remember the one the reader picks", async () => {
        // Arrange
        await renderBar()
        const withoutPackages = screen.queryByTestId("dependency-bar-hierarchy-segment")
        TestBed.resetTestingModule()
        const dispatch = await renderBar({ hasPackages: true })

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-hierarchy-packages"))

        // Assert
        expect(withoutPackages).toBeNull()
        expect(dispatch).toHaveBeenCalledWith(changed({ hierarchy: "packages" }))
    })

    it("should name the remembered hierarchy", async () => {
        // Arrange
        const settings = { hierarchy: "packages" } as const

        // Act
        await renderBar({ hasPackages: true, settings })

        // Assert
        expect(screen.getByTestId("dependency-bar-hierarchy-segment").textContent).toContain("Packages")
    })

    it("should say that the upward edge closing a cycle shares the upward colour until the line style shows the kind of use, and still let its own colour be picked", async () => {
        // Arrange
        const { fixture } = await renderBar()
        const ownColorOf = (type: string) =>
            fixture.debugElement.query(By.css(`[data-testid='dependency-bar-edge-color-${type}']`)).componentInstance.hexColor()
        const sampleColorOf = (type: string) =>
            screen.getByTestId(`dependency-bar-edges-${type}`).closest("li").querySelector("line").getAttribute("stroke")

        // Act
        const byEdgeType = {
            note: screen.queryByTestId("dependency-bar-edge-color-note"),
            own: ownColorOf("feedbackLeafLevel"),
            sample: sampleColorOf("feedbackLeafLevel")
        }
        TestBed.inject(MockStore).overrideSelector(dependencyGraphSettingsSelector, {
            ...defaultDependencyGraphSettings,
            lineStyleShows: "usage"
        })
        TestBed.inject(MockStore).refreshState()
        fixture.detectChanges()

        // Assert
        expect(byEdgeType.note).not.toBeNull()
        expect([byEdgeType.own, byEdgeType.sample]).toEqual(["#7f1d1d", "#dc2626"])
        expect(screen.queryByTestId("dependency-bar-edge-color-note")).toBeNull()
        expect(sampleColorOf("feedbackLeafLevel")).toBe("#7f1d1d")
    })
})
