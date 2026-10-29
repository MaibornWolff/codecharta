import { signal } from "@angular/core"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ToastService } from "../../../shared/facade"
import { fakeDirectory } from "../../services/fileSystemAccess.mocks"
import { LocalSourceService, SourceLookup } from "../../services/localSource.service"
import { LocalSourceFolder } from "../../services/localSourceFolders.repository"
import { highlightSource } from "../../services/syntaxHighlighter"
import { LocalSourceActionsComponent } from "./localSourceActions.component"

jest.mock("../../services/syntaxHighlighter", () => {
    const actual = jest.requireActual("../../services/syntaxHighlighter")
    return { highlightSource: jest.fn(actual.highlightSource) }
})

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
        it("should show the file's lines numbered in the source dialog", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath, "line one\nline two\n"))
            const component = (await renderActions()).componentInstance

            // Act
            await component.showSource("/root/src/Foo.kt")

            // Assert
            expect(component.shownSource()).toEqual(
                expect.objectContaining({ relativePath: "src/Foo.kt", lineNumbers: "1\n2", text: "line one\nline two\n" })
            )
            expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
        })

        it("should colour the shown file by its language", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath, "val answer = 42"))
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.showSource("/root/src/Foo.kt")
            fixture.detectChanges()

            // Assert
            const highlighted = screen.getByTestId("local-source-highlighted")
            expect(highlighted.querySelector(".token.keyword").textContent).toBe("val")
            expect(highlighted.querySelector(".token.number").textContent).toBe("42")
        })

        it("should leave a file of a language without a grammar plain", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath, "DEFINE VARIABLE x.", "orders.p"))
            const component = (await renderActions()).componentInstance

            // Act
            await component.showSource("/root/orders.p")

            // Assert
            expect(component.shownSource().highlightedHtml).toBeNull()
        })

        it("should not colour a file over the next one shown while the first was being coloured", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath, "val first = 1", "src/First.kt"))
            const component = (await renderActions()).componentInstance
            const shownMeanwhile = {
                relativePath: "src/Second.kt",
                lineNumbers: "1",
                text: "val second = 2",
                highlightedHtml: null,
                uncolouredReason: null
            }
            jest.mocked(highlightSource).mockImplementationOnce(() => {
                component.shownSource.set(shownMeanwhile)
                return "coloured first file"
            })

            // Act
            await component.showSource("/root/src/First.kt")

            // Assert
            expect(component.shownSource()).toBe(shownMeanwhile)
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
            expect(fixture.componentInstance.shownSource()).toBeNull()
            expect(screen.getByTestId("local-source-too-large").textContent).toContain(
                "This file is 6.2 MB, too large to show here (at most 5 MB)."
            )
        })

        it("should open a file too large to show in VS Code from the dialog", async () => {
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

        it("should show a file with minified lines plain and say why", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath, `var a=${"1,".repeat(12_000)}1`, "dist/vendor.js"))
            const fixture = await renderActions()

            // Act
            await fixture.componentInstance.showSource("/root/dist/vendor.js")
            fixture.detectChanges()

            // Assert
            expect(fixture.componentInstance.shownSource().highlightedHtml).toBeNull()
            expect(screen.getByTestId("local-source-uncoloured-note").textContent).toContain(
                "Shown without colours: has lines longer than 20,000 characters"
            )
        })

        it("should forget the shown file once the dialog closes", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue(found(folderWithoutEditorPath))
            const component = (await renderActions()).componentInstance
            await component.showSource("/root/src/Foo.kt")

            // Act
            component.closeSource()

            // Assert
            expect(component.shownSource()).toBeNull()
            expect(component.tooLargeFile()).toBeNull()
        })

        it("should warn when the file is not in the chosen folder", async () => {
            // Arrange
            localSourceMock.findSource.mockResolvedValue({ status: "notFound", relativePath: "src/Foo.kt" })
            const component = (await renderActions()).componentInstance

            // Act
            await component.showSource("/root/src/Foo.kt")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith('"src/Foo.kt" is not in the chosen folder', "warning")
            expect(component.shownSource()).toBeNull()
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
