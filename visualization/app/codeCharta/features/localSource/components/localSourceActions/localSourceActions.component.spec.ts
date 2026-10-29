import { signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ToastService } from "../../../shared/facade"
import { fakeDirectory } from "../../services/fileSystemAccess.mocks"
import { LocalSourceService, SourceLookup } from "../../services/localSource.service"
import { LocalSourceFolder } from "../../services/localSourceFolders.repository"
import { LocalSourceActionsComponent } from "./localSourceActions.component"

describe("LocalSourceActionsComponent", () => {
    const folderWithoutEditorPath: LocalSourceFolder = { mapKey: "map", directory: fakeDirectory("myproject", {}), editorRootPath: null }
    const folderWithEditorPath: LocalSourceFolder = { ...folderWithoutEditorPath, editorRootPath: "C:/dev/myproject" }
    const found = (folder: LocalSourceFolder, content = "line one\nline two", relativePath = "src/Foo.kt"): SourceLookup => ({
        status: "found",
        file: new File([content], relativePath.slice(relativePath.lastIndexOf("/") + 1)),
        folder,
        relativePath
    })

    const localSourceMock = {
        isAvailable: signal(true),
        findSource: jest.fn(),
        chooseFolder: jest.fn(),
        isMapRoot: jest.fn(),
        saveEditorRootPath: jest.fn()
    }
    const toastMock = { show: jest.fn() }
    let openSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
        openSpy = jest.spyOn(window, "open").mockImplementation(() => null)
    })

    afterEach(() => {
        openSpy.mockRestore()
    })

    async function renderActions() {
        const { fixture } = await render(LocalSourceActionsComponent, {
            providers: [
                { provide: LocalSourceService, useValue: localSourceMock },
                { provide: ToastService, useValue: toastMock }
            ]
        })
        return fixture
    }

    function givenFreshClick(isActive: boolean) {
        Object.defineProperty(navigator, "userActivation", { value: { isActive }, configurable: true })
    }

    describe("showSource", () => {
        it("should open the found file in the source viewer", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath, "line one\nline two\n", "notes/readme.txt"))
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.showSource("/root/notes/readme.txt")
            fixture.detectChanges()

            // Assert
            const viewer = screen.getByTestId("local-source-dialog")
            expect(viewer.textContent).toContain("readme.txt")
            expect(viewer.querySelectorAll(".cc-source-row")).toHaveLength(2)
        })

        it("should not read a file above 5 MB but say so and offer VS Code instead", async () => {
            // Arrange
            const hugeFile = { size: 6.2 * 1024 * 1024, text: jest.fn() } as unknown as File
            localSourceMock.findSource.mockResolvedValue({
                status: "found",
                file: hugeFile,
                folder: folderWithoutEditorPath,
                relativePath: "dist/main.js"
            })
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.showSource("/root/dist/main.js")
            fixture.detectChanges()

            // Assert
            expect(hugeFile.text).not.toHaveBeenCalled()
            expect(screen.getByTestId("local-source-dialog").querySelectorAll(".cc-source-row")).toHaveLength(0)
            expect(screen.getByTestId("local-source-too-large").textContent).toContain(
                "This file is 6.2 MB, too large to show here (at most 5 MB)."
            )
        })

        it("should open a file too large to show in VS Code from its dialog", async () => {
            // Arrange
            givenFreshClick(true)
            const hugeFile = { size: 6 * 1024 * 1024, text: jest.fn() } as unknown as File
            localSourceMock.findSource.mockResolvedValue({
                status: "found",
                file: hugeFile,
                folder: folderWithEditorPath,
                relativePath: "dist/main.js"
            })
            const fixture = await renderActions()
            await fixture.componentInstance.showSource("/root/dist/main.js")
            fixture.detectChanges()

            // Act
            await userEvent.click(screen.getByRole("button", { name: "Open in VS Code", hidden: true }))

            // Assert
            expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
            expect(openSpy).toHaveBeenCalledWith("vscode://file/C:/dev/myproject/dist/main.js", "_blank")
        })

        it("should forget the file too large to show once its dialog closes", async () => {
            // Arrange
            const hugeFile = { size: 6 * 1024 * 1024, text: jest.fn() } as unknown as File
            localSourceMock.findSource.mockResolvedValue({
                status: "found",
                file: hugeFile,
                folder: folderWithEditorPath,
                relativePath: "dist/main.js"
            })
            const fixture = await renderActions()
            await fixture.componentInstance.showSource("/root/dist/main.js")

            // Act
            screen.getByTestId("local-source-too-large-dialog").dispatchEvent(new Event("close"))

            // Assert
            expect(fixture.componentInstance.tooLargeFile()).toBeNull()
        })

        it("should open VS Code when the viewer asks for it", async () => {
            // Arrange
            givenFreshClick(true)
            localSourceMock.findSource.mockResolvedValue(found(folderWithEditorPath))
            const fixture = await renderActions()
            await fixture.componentInstance.showSource("/root/src/Foo.kt")
            fixture.detectChanges()

            // Act
            await userEvent.click(screen.getByTitle("Open the file in VS Code"))

            // Assert
            expect(openSpy).toHaveBeenCalledWith("vscode://file/C:/dev/myproject/src/Foo.kt", "_blank")
        })

        it("should warn when the file is not in the chosen folder", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue({ status: "notFound", relativePath: "src/Foo.kt" })
            const component = (await renderActions()).componentInstance

            // Act
            await component.showSource("/root/src/Foo.kt")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith('"src/Foo.kt" is not in the chosen folder', "warning")
            expect(screen.getByTestId("local-source-dialog").querySelectorAll(".cc-source-row")).toHaveLength(0)
        })

        it("should warn when the chosen folder does not fit the map", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue({ status: "doesNotFitMap" })
            const component = (await renderActions()).componentInstance

            // Act
            await component.showSource("/root/src/Foo.kt")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith("The chosen folder contains none of the map's files", "warning")
        })

        it("should report a folder that cannot be read", async () => {
            // Arrange
            localSourceMock.findSource.mockRejectedValue(new Error("no gesture"))
            const component = (await renderActions()).componentInstance

            // Act
            await component.showSource("/root/src/Foo.kt")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith("Could not read the local folder: no gesture", "error")
        })
    })

    describe("openInEditor", () => {
        it("should open VS Code right away while the click is fresh and the editor path is known", async () => {
            // Arrange
            givenFreshClick(true)
            localSourceMock.findSource.mockResolvedValue(found(folderWithEditorPath))
            const component = (await renderActions()).componentInstance

            // Act
            await component.openInEditor("/root/src/Foo.kt")

            // Assert
            expect(openSpy).toHaveBeenCalledWith("vscode://file/C:/dev/myproject/src/Foo.kt", "_blank")
            expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
        })

        it("should ask for the editor path once and open VS Code with it", async () => {
            // Arrange
            givenFreshClick(true)
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath))
            const fixture = await renderActions()
            await fixture.componentInstance.openInEditor("/root/src/Foo.kt")
            fixture.detectChanges()

            // Act
            await userEvent.type(screen.getByPlaceholderText("e.g. C:/dev/myproject", { exact: false }), "/home/dev/myproject")
            await userEvent.click(screen.getByRole("button", { name: "Open", hidden: true }))

            // Assert
            expect(openSpy).toHaveBeenCalledWith("vscode://file/home/dev/myproject/src/Foo.kt", "_blank")
            expect(localSourceMock.saveEditorRootPath).toHaveBeenCalledWith(folderWithoutEditorPath, "/home/dev/myproject")
        })

        it("should let the dialog supply a fresh click once a picker took the first one", async () => {
            // Arrange
            givenFreshClick(false)
            localSourceMock.findSource.mockResolvedValue(found(folderWithEditorPath))
            const component = (await renderActions()).componentInstance

            // Act
            await component.openInEditor("/root/src/Foo.kt")

            // Assert
            expect(openSpy).not.toHaveBeenCalled()
            expect(component.editorRootPath()).toBe("C:/dev/myproject")
            expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
        })

        it("should not open anything without an editor path", async () => {
            // Arrange
            const component = (await renderActions()).componentInstance

            // Act
            await component.confirmEditorRootPath()

            // Assert
            expect(openSpy).not.toHaveBeenCalled()
        })

        it("should not open anything when the file is missing", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue({ status: "cancelled" })
            const component = (await renderActions()).componentInstance

            // Act
            await component.openInEditor("/root/src/Foo.kt")

            // Assert
            expect(openSpy).not.toHaveBeenCalled()
            expect(toastMock.show).not.toHaveBeenCalled()
        })
    })

    describe("isMapRoot", () => {
        it("should ask the local source whether a node is a map's root", async () => {
            // Arrange
            localSourceMock.isMapRoot.mockReturnValue(true)
            const component = (await renderActions()).componentInstance

            // Act
            const isMapRoot = component.isMapRoot("/root")

            // Assert
            expect(isMapRoot).toBe(true)
            expect(localSourceMock.isMapRoot).toHaveBeenCalledWith("/root")
        })
    })

    describe("chooseFolder", () => {
        it("should confirm the chosen folder", async () => {
            // Arrange
            localSourceMock.chooseFolder.mockResolvedValue({ status: "chosen", folder: folderWithoutEditorPath })
            const component = (await renderActions()).componentInstance

            // Act
            await component.chooseFolder("/root")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith('Local folder "myproject" set for this map', "success")
            expect(localSourceMock.chooseFolder).toHaveBeenCalledWith("/root")
        })

        it("should warn when the chosen folder does not fit the map", async () => {
            // Arrange
            localSourceMock.chooseFolder.mockResolvedValue({ status: "doesNotFitMap" })
            const component = (await renderActions()).componentInstance

            // Act
            await component.chooseFolder("/root")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith("The chosen folder contains none of the map's files", "warning")
        })
    })
})
