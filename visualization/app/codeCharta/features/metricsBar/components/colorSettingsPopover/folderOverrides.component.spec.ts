import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { markPackages, unmarkPackage } from "../../../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { defaultState } from "../../../../state/store/state.manager"
import { markableFolderPathsSelector } from "../../selectors/markableFolderPaths.selector"
import { MarkedPackageWithCount, markedPackagesWithCountsSelector } from "../../selectors/markedPackagesWithCounts.selector"
import { FolderOverridesComponent } from "./folderOverrides.component"

describe("FolderOverridesComponent", () => {
    async function setup(overrides: MarkedPackageWithCount[] = [], folderPaths: string[] = [], markingColors?: unknown) {
        const initialState =
            markingColors === undefined
                ? defaultState
                : {
                      ...defaultState,
                      appSettings: {
                          ...defaultState.appSettings,
                          mapColors: { ...defaultState.appSettings.mapColors, markingColors: markingColors as string[] }
                      }
                  }
        const renderResult = await render(FolderOverridesComponent, {
            providers: [
                provideMockStore({
                    initialState,
                    selectors: [
                        { selector: markedPackagesWithCountsSelector, value: overrides },
                        { selector: markableFolderPathsSelector, value: folderPaths }
                    ]
                }),
                { provide: State, useValue: { getValue: () => initialState } }
            ]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should list the pinned folders with their file counts", async () => {
        // Arrange & Act
        await setup([
            { path: "/root/app", color: "#ff0000", fileCount: 51 },
            { path: "/root/ui", color: "#00ff00", fileCount: 115 }
        ])

        // Assert
        expect(screen.getByText("2 pinned")).not.toBeNull()
        expect(screen.getByText("/root/app")).not.toBeNull()
        expect(screen.getByText("51")).not.toBeNull()
        expect(screen.getByText("/root/ui")).not.toBeNull()
        expect(screen.getByText("115")).not.toBeNull()
    })

    it("should not show a pinned summary when nothing is pinned", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.queryByText(/\d+ pinned/)).toBeNull()
        expect(screen.getByText(/Pin a folder color/)).not.toBeNull()
    })

    it("should dispatch unmarkPackage when unpinning a folder", async () => {
        // Arrange
        await setup([{ path: "/root/app", color: "#ff0000", fileCount: 51 }])
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByTitle("Unpin /root/app"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(unmarkPackage({ path: "/root/app" }))
    })

    it("should dispatch markPackages with the new color when recoloring a folder", async () => {
        // Arrange
        const { component } = await setup([{ path: "/root/app", color: "#ff0000", fileCount: 51 }])
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleRecolor("/root/app", "#123456")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(markPackages({ packages: [{ path: "/root/app", color: "#123456" }] }))
    })

    it("should cancel the folder search on Escape without closing the surrounding popover", async () => {
        // Arrange
        await setup([], ["/root"])
        fireEvent.click(screen.getByText(/Pin a folder color/))
        const searchInput = screen.getByPlaceholderText("Search folders…")

        // Act
        const isDefaultNotPrevented = fireEvent.keyDown(searchInput, { key: "Escape" })

        // Assert: preventing the default cancels the native popover's close request
        expect(screen.queryByPlaceholderText("Search folders…")).toBeNull()
        expect(isDefaultNotPrevented).toBe(false)
    })

    it("should not pin a nested folder with its marked parent's color", async () => {
        // Arrange: all marking colors are taken, the naive fallback would collide with the parent
        const { markingColors } = defaultState.appSettings.mapColors
        const overrides = markingColors.map((color, index) => ({ path: `/root/folder${index}`, color, fileCount: 1 }))
        overrides[0] = { path: "/root", color: markingColors[0], fileCount: 1 }
        await setup(overrides, ["/root/sub"])
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByText(/Pin a folder color/))
        fireEvent.click(screen.getByRole("button", { name: "/root/sub" }))

        // Assert
        const dispatchedColor = dispatchSpy.mock.calls.at(-1)[0]["packages"][0].color
        expect(dispatchedColor).not.toBe(markingColors[0])
    })

    it("should pin a suggested folder with the first unused marking color", async () => {
        // Arrange
        const [firstMarkingColor, secondMarkingColor] = defaultState.appSettings.mapColors.markingColors
        await setup([{ path: "/root/app", color: firstMarkingColor, fileCount: 51 }], ["/root", "/root/ui"])
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByText(/Pin a folder color/))
        fireEvent.click(screen.getByText("/root/ui"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(markPackages({ packages: [{ path: "/root/ui", color: secondMarkingColor }] }))
    })

    it("should pin a folder when markingColors was persisted as an object with numeric keys", async () => {
        // Arrange: some browsers restore the persisted markingColors array as a plain object
        const [firstMarkingColor, secondMarkingColor] = defaultState.appSettings.mapColors.markingColors
        const markingColorsAsObject = { ...defaultState.appSettings.mapColors.markingColors }
        await setup([{ path: "/root/app", color: firstMarkingColor, fileCount: 51 }], ["/root", "/root/ui"], markingColorsAsObject)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByText(/Pin a folder color/))
        fireEvent.click(screen.getByText("/root/ui"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(markPackages({ packages: [{ path: "/root/ui", color: secondMarkingColor }] }))
    })

    it("should close the folder search when it loses focus while empty", async () => {
        // Arrange
        await setup([], ["/root"])
        fireEvent.click(screen.getByText(/Pin a folder color/))
        const searchInput = screen.getByPlaceholderText("Search folders…")

        // Act
        fireEvent.blur(searchInput)

        // Assert
        expect(screen.queryByPlaceholderText("Search folders…")).toBeNull()
        expect(screen.getByText(/Pin a folder color/)).not.toBeNull()
    })

    it("should keep the folder search open when it loses focus with a term in it", async () => {
        // Arrange
        await setup([], ["/root"])
        fireEvent.click(screen.getByText(/Pin a folder color/))
        const searchInput = screen.getByPlaceholderText("Search folders…")
        fireEvent.input(searchInput, { target: { value: "root" } })

        // Act
        fireEvent.blur(searchInput)

        // Assert
        expect(screen.getByPlaceholderText("Search folders…")).not.toBeNull()
    })

    it("should filter folder suggestions by the search term and exclude pinned folders", async () => {
        // Arrange
        await setup([{ path: "/root/app", color: "#ff0000", fileCount: 1 }], ["/root", "/root/app", "/root/ui", "/root/lib"])

        // Act
        fireEvent.click(screen.getByText(/Pin a folder color/))
        fireEvent.input(screen.getByPlaceholderText("Search folders…"), { target: { value: "ui" } })

        // Assert: only the matching, not yet pinned folder is suggested
        expect(screen.getByRole("button", { name: "/root/ui" })).not.toBeNull()
        expect(screen.queryByRole("button", { name: "/root/lib" })).toBeNull()
        expect(screen.queryByRole("button", { name: "/root/app" })).toBeNull()
    })
})
