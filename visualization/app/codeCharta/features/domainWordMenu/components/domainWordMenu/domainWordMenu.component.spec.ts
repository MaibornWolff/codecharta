import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { DomainWordMenuComponent } from "./domainWordMenu.component"

describe("DomainWordMenuComponent", () => {
    const showOccurrences = jest.fn()
    const closed = jest.fn()

    async function setup(
        rightClickedWord: { word: string; clientX: number; clientY: number } | null = { word: "invoice", clientX: 40, clientY: 80 }
    ) {
        jest.clearAllMocks()
        return render(DomainWordMenuComponent, {
            inputs: { rightClickedWord },
            on: { showOccurrences, closed },
            providers: [CopyToClipboardService]
        })
    }

    it("should render nothing while no word was right-clicked", async () => {
        // Arrange & Act
        await setup(null)

        // Assert
        expect(screen.queryByTestId("domain-word-menu")).toBeNull()
    })

    it("should name the right-clicked word", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("domain-word-menu").textContent).toContain("invoice")
    })

    it("should open the menu at the pointer", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const menu = screen.getByTestId("domain-word-menu")
        expect(menu.style.left).toBe("40px")
        expect(menu.style.top).toBe("80px")
    })

    it("should report the inspected word and close when occurrences are requested", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByText("Show occurrences"))

        // Assert
        expect(showOccurrences).toHaveBeenCalledWith("invoice")
        expect(closed).toHaveBeenCalled()
    })

    it("should copy the word without closing, so the feedback stays visible", async () => {
        // Arrange
        const writeText = jest.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })
        await setup()

        // Act
        await userEvent.click(screen.getByText("Copy word"))

        // Assert
        expect(writeText).toHaveBeenCalledWith("invoice")
        expect(closed).not.toHaveBeenCalled()
    })

    it("should close on a click outside the menu", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(document.body)

        // Assert
        expect(closed).toHaveBeenCalled()
    })

    it("should stay open on a click inside the menu", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByTestId("domain-word-menu").firstElementChild as HTMLElement)

        // Assert
        expect(closed).not.toHaveBeenCalled()
    })
})
