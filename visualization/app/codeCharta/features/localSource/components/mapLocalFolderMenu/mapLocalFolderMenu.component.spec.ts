import { signal } from "@angular/core"
import { fireEvent, render, screen } from "@testing-library/angular"
import { ToastService } from "../../../shared/facade"
import { fakeDirectory } from "../../services/fileSystemAccess.mocks"
import { LocalSourceService } from "../../services/localSource.service"
import { MapLocalFolderMenuComponent } from "./mapLocalFolderMenu.component"

describe("MapLocalFolderMenuComponent", () => {
    const localSourceMock = {
        isAvailable: signal(true),
        describeFolder: jest.fn(),
        chooseFolderForMap: jest.fn(),
        saveEditorRootPath: jest.fn()
    }
    const toastMock = { show: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        HTMLDialogElement.prototype.showModal = jest.fn()
        localSourceMock.isAvailable.set(true)
        localSourceMock.describeFolder.mockResolvedValue(null)
    })

    async function renderMenu() {
        const { fixture } = await render(MapLocalFolderMenuComponent, {
            providers: [
                { provide: LocalSourceService, useValue: localSourceMock },
                { provide: ToastService, useValue: toastMock }
            ]
        })
        return fixture
    }

    async function rightClick(fixture: Awaited<ReturnType<typeof renderMenu>>) {
        const event = new MouseEvent("contextmenu", { clientX: 10, clientY: 20, cancelable: true })
        fixture.componentInstance.openFor("myproject.cc.json", event)
        fixture.detectChanges()
        return event
    }

    it("should report a folder choice that fails", async () => {
        // Arrange
        localSourceMock.chooseFolderForMap.mockRejectedValue(new Error("storage gone"))
        const fixture = await renderMenu()

        // Act
        await fixture.componentInstance.chooseFolder("myproject.cc.json")

        // Assert
        expect(toastMock.show).toHaveBeenCalledWith("Could not read the local folder: storage gone", "error")
    })

    it("should report saved settings that cannot be read", async () => {
        // Arrange
        localSourceMock.describeFolder.mockRejectedValue(new Error("storage gone"))
        const fixture = await renderMenu()

        // Act
        await fixture.componentInstance.setEditorFolder("myproject.cc.json")

        // Assert
        expect(toastMock.show).toHaveBeenCalledWith("Could not read the local folder: storage gone", "error")
    })

    it("should keep the browser's menu where the browser cannot open a folder", async () => {
        // Arrange
        localSourceMock.isAvailable.set(false)
        const fixture = await renderMenu()

        // Act
        const event = await rightClick(fixture)

        // Assert
        expect(event.defaultPrevented).toBe(false)
        expect(fixture.componentInstance.target()).toBeNull()
    })

    it("should open at the right-click and offer to set each folder", async () => {
        // Arrange
        const fixture = await renderMenu()

        // Act
        const event = await rightClick(fixture)

        // Assert
        expect(event.defaultPrevented).toBe(true)
        expect(fixture.componentInstance.target()?.anchor).toEqual({ x: 10, y: 20 })
        expect(screen.getByText("Set Local Folder…")).not.toBe(null)
        expect(screen.getByText("Set VS Code Folder…")).not.toBe(null)
        expect(screen.queryByText("Forget Local Folder")).toBe(null)
    })

    it("should set the folder for the map and report it", async () => {
        // Arrange
        const folder = { mapKey: "myproject.cc.json", directory: fakeDirectory("myproject", {}), editorRootPath: null }
        localSourceMock.chooseFolderForMap.mockResolvedValue({ status: "chosen", folder })
        const fixture = await renderMenu()
        await rightClick(fixture)

        // Act
        fireEvent.click(screen.getByText("Set Local Folder…"))
        await fixture.whenStable()

        // Assert
        expect(localSourceMock.chooseFolderForMap).toHaveBeenCalledWith("myproject.cc.json")
        expect(toastMock.show).toHaveBeenCalledWith('Local folder "myproject" set for this map', "success")
        expect(fixture.componentInstance.target()).toBeNull()
    })

    it("should ask for the VS Code folder, showing the one already set", async () => {
        // Arrange
        localSourceMock.describeFolder.mockResolvedValue({ folderName: null, editorRootPath: "C:/dev/myproject" })
        const fixture = await renderMenu()
        await rightClick(fixture)

        // Act
        fireEvent.click(screen.getByText("Set VS Code Folder…"))
        await fixture.whenStable()
        fixture.detectChanges()

        // Assert
        expect(fixture.componentInstance.target()).toBeNull()
        expect(screen.getByLabelText<HTMLInputElement>("Full path of the folder", { selector: "input" })).not.toBe(null)
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it("should ask for the VS Code folder of a map without any folder", async () => {
        // Arrange
        const fixture = await renderMenu()
        await rightClick(fixture)

        // Act
        fireEvent.click(screen.getByText("Set VS Code Folder…"))
        await fixture.whenStable()

        // Assert
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })
})
