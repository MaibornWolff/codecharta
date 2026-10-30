import { signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import { LocalSourceService } from "../../services/localSource.service"
import { MapLocalFolderComponent } from "./mapLocalFolder.component"

describe("MapLocalFolderComponent", () => {
    const folderChanges = signal(0)
    const localSourceMock = { isAvailable: signal(true), folderChanges, describeFolder: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        localSourceMock.isAvailable.set(true)
        localSourceMock.describeFolder.mockResolvedValue(null)
    })

    async function renderFolder() {
        const renderResult = await render(MapLocalFolderComponent, {
            inputs: { mapFileName: "myproject.cc.json" },
            providers: [{ provide: LocalSourceService, useValue: localSourceMock }]
        })
        await renderResult.fixture.whenStable()
        renderResult.fixture.detectChanges()
        return renderResult
    }

    it("should show both the folder chosen in the picker and the path for VS Code", async () => {
        // Arrange
        localSourceMock.describeFolder.mockResolvedValue({ folderName: "myproject", editorRootPath: "C:/dev/myproject" })

        // Act
        await renderFolder()

        // Assert
        expect(screen.getByTestId("map-local-folder-name").textContent).toContain("myproject")
        expect(screen.getByTestId("map-local-folder-editor-path").textContent).toContain("C:/dev/myproject")
        expect(localSourceMock.describeFolder).toHaveBeenCalledWith("myproject.cc.json")
    })

    it.each([
        ["only the local folder is set", { folderName: "myproject", editorRootPath: null }, "myproject", "not set"],
        ["only the VS Code folder is set", { folderName: null, editorRootPath: "C:/dev/myproject" }, "not set", "C:/dev/myproject"],
        ["neither is set", null, "not set", "not set"]
    ])("should show each folder on its own when %s", async (_case, description, shownFolder, shownPath) => {
        // Arrange
        localSourceMock.describeFolder.mockResolvedValue(description)

        // Act
        await renderFolder()

        // Assert
        expect(screen.getByTestId("map-local-folder-name").textContent).toContain(shownFolder)
        expect(screen.getByTestId("map-local-folder-editor-path").textContent).toContain(shownPath)
    })

    it("should describe the folder again once a folder changed", async () => {
        // Arrange
        const { fixture } = await renderFolder()
        localSourceMock.describeFolder.mockResolvedValue({ folderName: "myproject", editorRootPath: null })

        // Act
        folderChanges.update(count => count + 1)
        fixture.detectChanges()
        await fixture.whenStable()
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("map-local-folder").textContent).toContain("myproject")
    })

    it("should not show the folder of a map the row no longer shows", async () => {
        // Arrange
        let resolveFirstMap: (description: object) => void
        localSourceMock.describeFolder.mockReturnValueOnce(new Promise(resolve => (resolveFirstMap = resolve)))
        localSourceMock.describeFolder.mockResolvedValueOnce({ folderName: "other", editorRootPath: "C:/dev/other" })
        const { fixture } = await render(MapLocalFolderComponent, {
            inputs: { mapFileName: "myproject.cc.json" },
            providers: [{ provide: LocalSourceService, useValue: localSourceMock }]
        })

        // Act
        fixture.componentRef.setInput("mapFileName", "other.cc.json")
        fixture.detectChanges()
        await fixture.whenStable()
        resolveFirstMap({ folderName: "myproject", editorRootPath: "C:/dev/myproject" })
        await fixture.whenStable()
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("map-local-folder").textContent).toContain("C:/dev/other")
    })

    it("should show nothing where the browser cannot open a folder", async () => {
        // Arrange
        localSourceMock.isAvailable.set(false)

        // Act
        await renderFolder()

        // Assert
        expect(screen.queryByTestId("map-local-folder")).toBe(null)
        expect(localSourceMock.describeFolder).not.toHaveBeenCalled()
    })
})
