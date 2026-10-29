import { fireEvent, render, screen } from "@testing-library/angular"
import { ToastService } from "../../../shared/facade"
import { fakeDirectory } from "../../services/fileSystemAccess.mocks"
import { LocalSourceService } from "../../services/localSource.service"
import { MapLocalFolderMenuComponent } from "./mapLocalFolderMenu.component"

describe("MapLocalFolderMenuComponent", () => {
    const localSourceMock = {
        isSupported: true,
        describeFolder: jest.fn(),
        chooseFolderForMap: jest.fn(),
        forgetFolder: jest.fn()
    }
    const toastMock = { show: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        localSourceMock.isSupported = true
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
        await fixture.componentInstance.openFor("myproject.cc.json", event)
        fixture.detectChanges()
        return event
    }

    it("should keep the browser's menu where the browser cannot open a folder", async () => {
        // Arrange
        localSourceMock.isSupported = false
        const fixture = await renderMenu()

        // Act
        const event = await rightClick(fixture)

        // Assert
        expect(event.defaultPrevented).toBe(false)
        expect(fixture.componentInstance.target()).toBeNull()
    })

    it("should open at the right-click and offer only to set the folder while none is set", async () => {
        // Arrange
        const fixture = await renderMenu()

        // Act
        const event = await rightClick(fixture)

        // Assert
        expect(event.defaultPrevented).toBe(true)
        expect(fixture.componentInstance.target()?.anchor).toEqual({ x: 10, y: 20 })
        expect(screen.getByText("Set Local Folder…")).not.toBe(null)
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

    it("should forget the map's folder", async () => {
        // Arrange
        localSourceMock.describeFolder.mockResolvedValue("myproject")
        const fixture = await renderMenu()
        await rightClick(fixture)

        // Act
        fireEvent.click(screen.getByText("Forget Local Folder"))
        await fixture.whenStable()

        // Assert
        expect(localSourceMock.forgetFolder).toHaveBeenCalledWith("myproject.cc.json")
        expect(fixture.componentInstance.target()).toBeNull()
    })
})
