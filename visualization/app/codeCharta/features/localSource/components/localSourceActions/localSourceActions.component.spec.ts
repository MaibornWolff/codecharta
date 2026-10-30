import { signal } from "@angular/core"
import { render, screen, waitFor, within } from "@testing-library/angular"
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
        chooseFolderAndFindSource: jest.fn(),
        chooseFolder: jest.fn(),
        isMapRoot: jest.fn(),
        editorTargetOf: jest.fn(),
        saveEditorRootPath: jest.fn()
    }
    const toastMock = { show: jest.fn() }
    let openedLinks: string[]
    let linkClickSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
        openedLinks = []
        linkClickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            openedLinks.push(this.href)
        })
    })

    afterEach(() => {
        linkClickSpy.mockRestore()
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
            localSourceMock.editorTargetOf.mockResolvedValue({
                mapFileName: "map.cc.json",
                relativePath: "dist/main.js",
                editorRootPath: "C:/dev/myproject"
            })
            const fixture = await renderActions()
            await fixture.componentInstance.showSource("/root/dist/main.js")
            fixture.detectChanges()

            // Act
            await userEvent.click(
                within(screen.getByTestId("local-source-too-large")).getByRole("button", { name: "Open in VS Code", hidden: true })
            )

            // Assert
            expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
            expect(openedLinks).toEqual(["vscode://file/C:/dev/myproject/dist/main.js"])
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
            localSourceMock.editorTargetOf.mockResolvedValue({
                mapFileName: "map.cc.json",
                relativePath: "src/Foo.kt",
                editorRootPath: "C:/dev/myproject"
            })
            const fixture = await renderActions()
            await fixture.componentInstance.showSource("/root/src/Foo.kt")
            fixture.detectChanges()

            // Act
            await userEvent.click(screen.getByTitle("Open the file in VS Code"))

            // Assert
            expect(openedLinks).toEqual(["vscode://file/C:/dev/myproject/src/Foo.kt"])
        })

        describe("when a folder is needed", () => {
            const folderNeeded = (missingFrom: string | null) => ({
                status: "folderNeeded",
                mapFileName: "sample1.cc.json",
                relativePath: "src/Foo.kt",
                missingFrom
            })

            async function askForFolder(missingFrom: string | null = null) {
                localSourceMock.findSource.mockResolvedValue(folderNeeded(missingFrom))
                const fixture = await renderActions()
                await fixture.componentInstance.showSource("/root/src/Foo.kt")
                fixture.detectChanges()
                return fixture
            }

            it("should explain why before opening the browser's picker", async () => {
                // Act
                await askForFolder()

                // Assert
                const dialog = screen.getByTestId("local-source-folder-dialog")
                expect(dialog.textContent).toContain("Please select the root folder of")
                expect(dialog.textContent).toContain("sample1")
                expect(dialog.textContent).toContain("viewed in the browser")
                expect(screen.queryByTestId("local-source-folder-missing")).toBeNull()
                expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
                expect(localSourceMock.chooseFolderAndFindSource).not.toHaveBeenCalled()
            })

            it("should say which file the saved folder lacks", async () => {
                // Act
                await askForFolder("old")

                // Assert
                const missing = screen.getByTestId("local-source-folder-missing").textContent
                expect(missing).toContain("src/Foo.kt")
                expect(missing).toContain("old")
            })

            it("should open the picker on the button and show the file found", async () => {
                // Arrange
                await askForFolder()
                localSourceMock.chooseFolderAndFindSource.mockResolvedValue(
                    found(folderWithoutEditorPath, "one\ntwo\n", "notes/readme.txt")
                )

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Select folder…", hidden: true }))

                // Assert
                expect(localSourceMock.chooseFolderAndFindSource).toHaveBeenCalledWith("/root/src/Foo.kt")
                expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
                await waitFor(() => expect(screen.getByTestId("local-source-dialog").querySelectorAll(".cc-source-row")).toHaveLength(2))
            })

            it("should show nothing when the picker is cancelled", async () => {
                // Arrange
                await askForFolder()
                localSourceMock.chooseFolderAndFindSource.mockResolvedValue({ status: "cancelled" })

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Select folder…", hidden: true }))

                // Assert
                expect(screen.getByTestId("local-source-dialog").querySelectorAll(".cc-source-row")).toHaveLength(0)
                expect(toastMock.show).not.toHaveBeenCalled()
            })

            it("should forget the request once the dialog closes", async () => {
                // Arrange
                const fixture = await askForFolder()

                // Act
                screen.getByTestId("local-source-folder-dialog").dispatchEvent(new Event("close"))

                // Assert
                expect(fixture.componentInstance.folderRequest()).toBeNull()
            })
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
        const target = (editorRootPath: string | null) => ({ mapFileName: "map.cc.json", relativePath: "src/Foo.kt", editorRootPath })

        it("should open VS Code right away while the click is fresh and the path is known, without touching the local folder", async () => {
            // Arrange
            givenFreshClick(true)
            localSourceMock.editorTargetOf.mockResolvedValue(target("C:/dev/myproject"))
            const component = (await renderActions()).componentInstance

            // Act
            await component.openInEditor("/root/src/Foo.kt")

            // Assert
            expect(openedLinks).toEqual(["vscode://file/C:/dev/myproject/src/Foo.kt"])
            expect(localSourceMock.findSource).not.toHaveBeenCalled()
            expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
        })

        it("should ask for the path when none is known", async () => {
            // Arrange
            givenFreshClick(true)
            localSourceMock.editorTargetOf.mockResolvedValue(target(null))
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.openInEditor("/root/src/Foo.kt")
            fixture.detectChanges()

            // Assert
            expect(openedLinks).toEqual([])
            expect(screen.getByTestId("local-source-editor-ask")).not.toBe(null)
        })

        it("should let the dialog supply a fresh click when the first one went stale", async () => {
            // Arrange
            givenFreshClick(false)
            localSourceMock.editorTargetOf.mockResolvedValue(target("C:/dev/myproject"))
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.openInEditor("/root/src/Foo.kt")
            fixture.detectChanges()

            // Assert
            expect(openedLinks).toEqual([])
            expect(screen.getByTestId("local-source-editor-confirm")).not.toBe(null)
        })

        it("should do nothing for a node outside the visible maps", async () => {
            // Arrange
            localSourceMock.editorTargetOf.mockResolvedValue(null)
            const component = (await renderActions()).componentInstance

            // Act
            await component.openInEditor("/root/gone.cc.json/Foo.kt")

            // Assert
            expect(openedLinks).toEqual([])
            expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
        })

        it("should report a saved path that cannot be read", async () => {
            // Arrange
            localSourceMock.editorTargetOf.mockRejectedValue(new Error("storage gone"))
            const component = (await renderActions()).componentInstance

            // Act
            await component.openInEditor("/root/src/Foo.kt")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith("Could not read the local folder: storage gone", "error")
        })
    })

    describe("setEditorFolder", () => {
        it("should ask for the map's VS Code folder with no file waiting to open", async () => {
            // Arrange
            localSourceMock.editorTargetOf.mockResolvedValue({ mapFileName: "map.cc.json", relativePath: "", editorRootPath: null })
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.setEditorFolder("/root")
            fixture.detectChanges()

            // Assert
            expect(screen.getByRole("button", { name: "Save", hidden: true })).not.toBe(null)
        })

        it("should ask nothing for a node outside the visible maps", async () => {
            // Arrange
            localSourceMock.editorTargetOf.mockResolvedValue(null)
            const component = (await renderActions()).componentInstance

            // Act
            await component.setEditorFolder("/root/gone.cc.json")

            // Assert
            expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
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
