import { fireEvent, render, screen } from "@testing-library/angular"
import { BehaviorSubject, of } from "rxjs"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { LayoutTabComponent } from "./layoutTab.component"

describe("LayoutTabComponent", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    async function setup(layoutAlgorithm = LayoutAlgorithm.SquarifiedTreeMap) {
        const layoutAlgorithm$ = new BehaviorSubject(layoutAlgorithm)
        const writeStore = { setLayoutAlgorithm: jest.fn(), setMaxTreeMapFiles: jest.fn() }
        const renderResult = await render(LayoutTabComponent, {
            providers: [
                { provide: MapStateReadWindow, useValue: { layoutAlgorithm$ } },
                { provide: PreferencesReadWindow, useValue: { maxTreeMapFiles$: of(100) } },
                { provide: MetricsBarWriteStore, useValue: writeStore }
            ]
        })
        return { layoutAlgorithm$, writeStore, fixture: renderResult.fixture }
    }

    const layoutTile = (layout: LayoutAlgorithm) => screen.getByRole("button", { name: new RegExp(`^${layout}`) })

    it("should name the current layout on the tab", async () => {
        // Arrange & Act
        await setup(LayoutAlgorithm.StreetMap)

        // Assert
        expect(screen.getByTestId("metrics-bar-layout-tab").textContent).toContain(LayoutAlgorithm.StreetMap)
    })

    it("should rename the tab when the layout changes", async () => {
        // Arrange
        const { layoutAlgorithm$, fixture } = await setup()

        // Act
        layoutAlgorithm$.next(LayoutAlgorithm.Sunburst)
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("metrics-bar-layout-tab").textContent).toContain(LayoutAlgorithm.Sunburst)
    })

    it("should offer one tile for every layout", async () => {
        // Arrange & Act
        await setup()

        // Assert
        for (const layout of Object.values(LayoutAlgorithm)) {
            expect(layoutTile(layout)).toBeTruthy()
        }
    })

    it("should mark only the current layout's tile as pressed", async () => {
        // Arrange & Act
        await setup(LayoutAlgorithm.TreeMapStreet)

        // Assert
        expect(layoutTile(LayoutAlgorithm.TreeMapStreet).getAttribute("aria-pressed")).toBe("true")
        expect(layoutTile(LayoutAlgorithm.StreetMap).getAttribute("aria-pressed")).toBe("false")
    })

    it("should set the layout when its tile is clicked", async () => {
        // Arrange
        const { writeStore } = await setup()

        // Act
        fireEvent.click(layoutTile(LayoutAlgorithm.Sunburst))

        // Assert
        expect(writeStore.setLayoutAlgorithm).toHaveBeenCalledWith(LayoutAlgorithm.Sunburst)
    })

    it("should hide the file limit when the layout is not TreeMapStreet", async () => {
        // Arrange & Act
        await setup(LayoutAlgorithm.StreetMap)

        // Assert
        expect(screen.queryByRole("spinbutton", { name: "Maximum TreeMap Files" })).toBeNull()
    })

    it("should set the file limit after the debounce while the layout is TreeMapStreet", async () => {
        // Arrange
        jest.useFakeTimers()
        const { writeStore } = await setup(LayoutAlgorithm.TreeMapStreet)
        const fileLimitInput = screen.getByRole("spinbutton", { name: "Maximum TreeMap Files" })

        // Act
        fireEvent.input(fileLimitInput, { target: { value: "250" } })
        jest.advanceTimersByTime(400)

        // Assert
        expect(writeStore.setMaxTreeMapFiles).toHaveBeenCalledWith(250)
    })
})
