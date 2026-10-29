import { signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import { LocalSourceService } from "../../services/localSource.service"
import { MapLocalFolderComponent } from "./mapLocalFolder.component"

describe("MapLocalFolderComponent", () => {
    const folderChanges = signal(0)
    const localSourceMock = { isSupported: true, folderChanges, describeFolder: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        localSourceMock.isSupported = true
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

    it("should show the map's local folder", async () => {
        // Arrange
        localSourceMock.describeFolder.mockResolvedValue("C:/dev/myproject")

        // Act
        await renderFolder()

        // Assert
        expect(screen.getByTestId("map-local-folder").textContent).toContain("C:/dev/myproject")
        expect(localSourceMock.describeFolder).toHaveBeenCalledWith("myproject.cc.json")
    })

    it("should say when the map has no local folder", async () => {
        // Act
        await renderFolder()

        // Assert
        expect(screen.getByTestId("map-local-folder").textContent).toContain("No local folder")
    })

    it("should describe the folder again once a folder changed", async () => {
        // Arrange
        const { fixture } = await renderFolder()
        localSourceMock.describeFolder.mockResolvedValue("myproject")

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
        let resolveFirstMap: (description: string) => void
        localSourceMock.describeFolder.mockReturnValueOnce(new Promise(resolve => (resolveFirstMap = resolve)))
        localSourceMock.describeFolder.mockResolvedValueOnce("C:/dev/other")
        const { fixture } = await render(MapLocalFolderComponent, {
            inputs: { mapFileName: "myproject.cc.json" },
            providers: [{ provide: LocalSourceService, useValue: localSourceMock }]
        })

        // Act
        fixture.componentRef.setInput("mapFileName", "other.cc.json")
        fixture.detectChanges()
        await fixture.whenStable()
        resolveFirstMap("C:/dev/myproject")
        await fixture.whenStable()
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("map-local-folder").textContent).toContain("C:/dev/other")
    })

    it("should show nothing where the browser cannot open a folder", async () => {
        // Arrange
        localSourceMock.isSupported = false

        // Act
        await renderFolder()

        // Assert
        expect(screen.queryByTestId("map-local-folder")).toBe(null)
        expect(localSourceMock.describeFolder).not.toHaveBeenCalled()
    })
})
