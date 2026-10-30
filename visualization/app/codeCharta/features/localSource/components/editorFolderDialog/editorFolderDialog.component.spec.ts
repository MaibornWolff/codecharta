import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LocalSourceService } from "../../services/localSource.service"
import { EditorFolderDialogComponent, EditorFolderRequest } from "./editorFolderDialog.component"

describe("EditorFolderDialogComponent", () => {
    const localSourceMock = { saveEditorRootPath: jest.fn().mockResolvedValue(undefined) }
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

    async function ask(request: Partial<EditorFolderRequest> = {}) {
        const { fixture } = await render(EditorFolderDialogComponent, {
            providers: [{ provide: LocalSourceService, useValue: localSourceMock }]
        })
        fixture.componentInstance.ask({ mapFileName: "myproject.cc.json", editorRootPath: null, fileToOpen: null, ...request })
        fixture.detectChanges()
        return fixture
    }

    const pathInput = () => screen.getByLabelText("Full path of the folder", { selector: "input" })

    it("should ask for the path of the map's project folder with an example for every system", async () => {
        // Act
        await ask()

        // Assert
        expect(screen.getByTestId("local-source-editor-ask").textContent).toContain("full path of the project folder for")
        expect(screen.getByTestId("local-source-editor-ask").textContent).toContain("myproject")
        expect(screen.getByTestId("local-source-editor-ask").textContent).not.toContain(".cc.json")
        expect(pathInput().getAttribute("placeholder")).toBe("e.g. /Users/you/dev/project or C:\\dev\\project")
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it("should only save the path when no file is waiting to open", async () => {
        // Arrange
        await ask()

        // Act
        await userEvent.type(pathInput(), " /home/dev/myproject ")
        await userEvent.click(screen.getByRole("button", { name: "Save", hidden: true }))

        // Assert
        expect(localSourceMock.saveEditorRootPath).toHaveBeenCalledWith("myproject.cc.json", "/home/dev/myproject")
        expect(openedLinks).toEqual([])
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
    })

    it("should open the waiting file with the entered path and save the path", async () => {
        // Arrange
        await ask({ fileToOpen: "src/Foo.kt" })

        // Act
        await userEvent.type(pathInput(), "/home/dev/myproject")
        await userEvent.click(screen.getByRole("button", { name: "Open in VS Code", hidden: true }))

        // Assert
        expect(openedLinks).toEqual(["vscode://file/home/dev/myproject/src/Foo.kt"])
        expect(localSourceMock.saveEditorRootPath).toHaveBeenCalledWith("myproject.cc.json", "/home/dev/myproject")
    })

    it("should only ask to confirm when the path is known and a file is waiting", async () => {
        // Act
        const fixture = await ask({ editorRootPath: "C:/dev/myproject", fileToOpen: "src/Foo.kt" })

        // Assert
        expect(screen.getByTestId("local-source-editor-confirm").textContent).toContain("Foo.kt")
        expect(screen.queryByTestId("local-source-editor-ask")).toBeNull()
        expect(fixture.componentInstance.editorRootPath()).toBe("C:/dev/myproject")
    })

    it("should show the known path for changing it when no file is waiting", async () => {
        // Act
        const fixture = await ask({ editorRootPath: "C:/dev/myproject" })

        // Assert
        expect(screen.getByTestId("local-source-editor-ask")).not.toBe(null)
        expect(fixture.componentInstance.editorRootPath()).toBe("C:/dev/myproject")
    })

    it("should do nothing without a path", async () => {
        // Arrange
        const fixture = await ask({ fileToOpen: "src/Foo.kt" })

        // Act
        await fixture.componentInstance.confirm()

        // Assert
        expect(openedLinks).toEqual([])
        expect(localSourceMock.saveEditorRootPath).not.toHaveBeenCalled()
    })
})
