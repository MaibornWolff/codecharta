import { signal } from "@angular/core"
import { fireEvent, render, screen } from "@testing-library/angular"
import { HiddenWordsReadStore } from "../../stores/hiddenWords.read.store"
import { HiddenWordsWriteStore } from "../../stores/hiddenWords.write.store"
import { HiddenWordsPopoverComponent } from "./hiddenWordsPopover.component"

describe("HiddenWordsPopoverComponent", () => {
    let writeStore: jest.Mocked<Partial<HiddenWordsWriteStore>>

    async function setup(hiddenWords: string[] = []) {
        writeStore = { restore: jest.fn(), restoreAll: jest.fn() }
        return render(HiddenWordsPopoverComponent, {
            inputs: { popoverId: "hidden-words", anchorName: "hidden-words-chip" },
            providers: [
                { provide: HiddenWordsReadStore, useValue: { hiddenWords: signal(hiddenWords) } },
                { provide: HiddenWordsWriteStore, useValue: writeStore }
            ]
        })
    }

    it("should say how to hide a word while none is hidden", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("domain-hidden-words-empty")).not.toBeNull()
        expect(screen.queryByTestId("domain-hidden-words-list")).toBeNull()
    })

    it("should list the hidden words alphabetically and restore the one that is picked", async () => {
        // Arrange
        await setup(["payment", "invoice"])

        // Act
        const listedWords = screen.getByTestId("domain-hidden-words-list").textContent
        fireEvent.click(screen.getByTestId("domain-restore-payment"))

        // Assert
        expect(listedWords?.indexOf("invoice")).toBeLessThan(listedWords?.indexOf("payment") ?? 0)
        expect(writeStore.restore).toHaveBeenCalledWith("payment")
    })

    it("should restore every hidden word at once", async () => {
        // Arrange
        await setup(["invoice"])

        // Act
        fireEvent.click(screen.getByTestId("domain-restore-all-words"))

        // Assert
        expect(writeStore.restoreAll).toHaveBeenCalled()
    })
})
