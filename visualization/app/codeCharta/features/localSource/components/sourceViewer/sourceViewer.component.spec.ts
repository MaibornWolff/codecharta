import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { highlightSource } from "../../services/syntaxHighlighter"
import { SourceViewerComponent, ViewedFile } from "./sourceViewer.component"

jest.mock("../../services/syntaxHighlighter", () => {
    const actual = jest.requireActual("../../services/syntaxHighlighter")
    return { highlightSource: jest.fn(actual.highlightSource) }
})

describe("SourceViewerComponent", () => {
    const aFile = (text: string, relativePath = "src/app/Greeting.kt"): ViewedFile => ({
        nodePath: `/root/${relativePath}`,
        relativePath,
        text,
        bytes: text.length,
        encoding: "UTF-8"
    })
    let writeText: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
        writeText = jest.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    })

    async function openViewer(file: ViewedFile) {
        const renderResult = await render(SourceViewerComponent)
        await renderResult.fixture.componentInstance.open(file)
        renderResult.fixture.detectChanges()
        return renderResult
    }

    const rows = () => screen.getByTestId("local-source-dialog").querySelectorAll(".cc-source-row")

    it("should show the file's folder, name, language, size and lines", async () => {
        // Act
        await openViewer(aFile("val answer = 42\n"))

        // Assert
        const header = screen.getByRole("heading", { hidden: true })
        expect(header.textContent.trim()).toBe("src/app/Greeting.kt")
        expect(header.querySelector(".font-semibold").textContent).toBe("Greeting.kt")
        expect(screen.getByTestId("source-viewer-language").textContent.trim()).toBe("Kotlin")
        const statusBar = screen.getByRole("contentinfo", { hidden: true })
        expect([...statusBar.children].map(part => part.textContent.trim())).toEqual(["Kotlin", "1 line", "16 B", "UTF-8"])
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    describe("history entry", () => {
        let pushState: jest.SpyInstance
        let back: jest.SpyInstance

        beforeEach(() => {
            pushState = jest.spyOn(window.history, "pushState").mockImplementation(() => undefined)
            back = jest.spyOn(window.history, "back").mockImplementation(() => undefined)
        })

        afterEach(() => {
            pushState.mockRestore()
            back.mockRestore()
        })

        const closeEventOfDialog = () => screen.getByTestId("local-source-dialog").dispatchEvent(new Event("close"))

        it("should add a history entry when it opens", async () => {
            // Act
            await openViewer(aFile("val answer = 42\n"))

            // Assert
            expect(pushState).toHaveBeenCalledTimes(1)
        })

        it("should close without going back again when the browser went back", async () => {
            // Arrange
            await openViewer(aFile("val answer = 42\n"))

            // Act
            window.dispatchEvent(new PopStateEvent("popstate"))
            closeEventOfDialog()

            // Assert
            expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1)
            expect(back).not.toHaveBeenCalled()
        })

        it("should remove its history entry when it is closed some other way", async () => {
            // Arrange
            await openViewer(aFile("val answer = 42\n"))

            // Act
            closeEventOfDialog()

            // Assert
            expect(back).toHaveBeenCalledTimes(1)
        })

        it("should add only one history entry when a second file opens over the first", async () => {
            // Arrange
            const { fixture } = await openViewer(aFile("val answer = 42\n"))

            // Act
            await fixture.componentInstance.open(aFile("val other = 1\n"))

            // Assert
            expect(pushState).toHaveBeenCalledTimes(1)
        })

        it("should ignore the browser going back while it is closed", async () => {
            // Arrange
            await render(SourceViewerComponent)

            // Act
            window.dispatchEvent(new PopStateEvent("popstate"))

            // Assert
            expect(HTMLDialogElement.prototype.close).not.toHaveBeenCalled()
        })
    })

    it("should keep the keys it gets from the map behind it", async () => {
        // Arrange
        await openViewer(aFile("val answer = 42\n"))
        const keysAtTheWindow = jest.fn()
        window.addEventListener("keydown", keysAtTheWindow)

        // Act
        screen
            .getByLabelText("Source code", { selector: "div" })
            .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))

        // Assert
        window.removeEventListener("keydown", keysAtTheWindow)
        expect(keysAtTheWindow).not.toHaveBeenCalled()
    })

    it("should put the focus on the code so that keys scroll it", async () => {
        // Act
        await openViewer(aFile("val answer = 42\n"))

        // Assert
        expect(document.activeElement).toBe(screen.getByLabelText("Source code", { selector: "div" }))
    })

    it("should say so when the browser does not allow copying", async () => {
        // Arrange
        const { fixture } = await openViewer(aFile("val answer = 42\n"))
        writeText.mockRejectedValue(new DOMException("denied", "NotAllowedError"))

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Copy", hidden: true }))
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("source-viewer-copy-failed").textContent).toContain("did not allow copying")
    })

    it("should colour the file by its language, one row per line", async () => {
        // Act
        await openViewer(aFile("val answer = 42\nfun greet() = 1\n"))

        // Assert
        expect(rows()).toHaveLength(2)
        const coloured = screen.getByTestId("local-source-highlighted")
        expect(coloured.querySelector(".token.keyword").textContent).toBe("val")
        expect(coloured.querySelector(".token.number").textContent).toBe("42")
    })

    it("should leave a file of a language without a grammar plain and name its language", async () => {
        // Act
        await openViewer(aFile("DEFINE VARIABLE x AS INTEGER.", "orders.p"))

        // Assert
        expect(screen.getByTestId("local-source-plain")).not.toBe(null)
        expect(screen.getByTestId("source-viewer-language").textContent.trim()).toBe("ABL")
        expect(highlightSource).not.toHaveBeenCalled()
    })

    it("should show a file with minified lines plain and say why", async () => {
        // Act
        await openViewer(aFile(`var a=${"1,".repeat(12_000)}1`, "dist/vendor.js"))

        // Assert
        expect(screen.getByTestId("local-source-plain")).not.toBe(null)
        expect(screen.getByTestId("local-source-uncoloured-note").textContent).toContain(
            "Shown without colours: has lines longer than 20,000 characters"
        )
    })

    it("should not colour a file over the next one shown while the first was being coloured", async () => {
        // Arrange
        const { fixture } = await render(SourceViewerComponent)
        const viewer = fixture.componentInstance
        jest.mocked(highlightSource).mockImplementationOnce(() => {
            void viewer.open(aFile("plain words", "notes.txt"))
            return "coloured first file"
        })

        // Act
        await viewer.open(aFile("val first = 1"))

        // Assert
        expect(viewer.source().relativePath).toBe("notes.txt")
        expect(viewer.rowsHtml()).not.toContain("coloured first file")
        expect(viewer.isColoured()).toBe(false)
    })

    it("should mark the line whose number is clicked and name it in the status bar", async () => {
        // Arrange
        const { fixture } = await openViewer(aFile("first\nsecond\nthird"))

        // Act
        await userEvent.click(rows()[1].querySelector(".cc-source-number"))
        await userEvent.click(rows()[2].querySelector(".cc-source-number"))
        fixture.detectChanges()

        // Assert
        expect([...rows()].map(row => row.classList.contains("cc-source-row-selected"))).toEqual([false, false, true])
        expect(screen.getByTestId("source-viewer-line").textContent.trim()).toBe("Ln 3")
    })

    it("should leave the marked line alone when the code itself is clicked", async () => {
        // Arrange
        const { fixture } = await openViewer(aFile("first\nsecond"))

        // Act
        await userEvent.click(rows()[0].querySelector(".cc-source-code"))

        // Assert
        expect(fixture.componentInstance.selectedLine()).toBeNull()
    })

    it("should wrap long lines on request and remember it in this browser", async () => {
        // Arrange
        const { fixture } = await openViewer(aFile("a long line"))

        // Act
        await userEvent.click(screen.getByTestId("source-viewer-wrap"))
        fixture.detectChanges()

        // Assert
        expect(screen.getByTestId("local-source-highlighted").classList.contains("cc-source-wraps")).toBe(true)
        expect(screen.getByTestId("source-viewer-wrap").getAttribute("aria-pressed")).toBe("true")
        expect(localStorage.getItem("codecharta.sourceViewer.wrapsLines")).toBe("true")
    })

    it("should start wrapped when the reader wrapped lines before", async () => {
        // Arrange
        localStorage.setItem("codecharta.sourceViewer.wrapsLines", "true")

        // Act
        const { fixture } = await openViewer(aFile("a long line"))

        // Assert
        expect(fixture.componentInstance.wrapsLines()).toBe(true)
    })

    it("should still wrap lines in a browser that keeps no storage, and forget it with the page", async () => {
        // Arrange
        jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("storage disabled", "SecurityError")
        })
        jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new DOMException("storage disabled", "SecurityError")
        })
        const { fixture } = await openViewer(aFile("a long line"))

        // Act
        await userEvent.click(screen.getByTestId("source-viewer-wrap"))

        // Assert
        expect(fixture.componentInstance.wrapsLines()).toBe(true)
        jest.restoreAllMocks()
    })

    it.each([
        ["Copy path", "src/app/Greeting.kt"],
        ["Copy", "val answer = 42"]
    ])("should copy on %s and confirm it", async (buttonName, copied) => {
        // Arrange
        const { fixture } = await openViewer(aFile("val answer = 42"))

        // Act
        await userEvent.click(screen.getByRole("button", { name: buttonName, hidden: true }))
        fixture.detectChanges()

        // Assert
        expect(writeText).toHaveBeenCalledWith(copied)
        expect(screen.getByRole("button", { name: "Copied", hidden: true })).not.toBe(null)
    })

    it("should ask for VS Code with the file's node path", async () => {
        // Arrange
        const { fixture } = await openViewer(aFile("val answer = 42"))
        const requested: string[] = []
        fixture.componentInstance.openInEditor.subscribe(nodePath => requested.push(nodePath))

        // Act
        await userEvent.click(screen.getByTitle("Open the file in VS Code"))

        // Assert
        expect(requested).toEqual(["/root/src/app/Greeting.kt"])
    })

    it("should go back to the map and forget the file", async () => {
        // Arrange
        const { fixture } = await openViewer(aFile("val answer = 42"))

        // Act
        await userEvent.click(screen.getByTestId("source-viewer-back"))
        screen.getByTestId("local-source-dialog").dispatchEvent(new Event("close"))

        // Assert
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
        expect(fixture.componentInstance.source()).toBeNull()
    })
})
