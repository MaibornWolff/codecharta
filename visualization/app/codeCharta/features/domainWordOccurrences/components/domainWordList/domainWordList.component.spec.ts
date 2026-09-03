import { Component, input, output } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { STATE } from "../../../../mocks/dataMocks"
import { CcState, DomainLensData } from "../../../../model/codeCharta.model"
import { WordSorting, WordSortingOption } from "../../util/sortWords"
import { DomainWordRowComponent } from "../domainWordRow/domainWordRow.component"
import { DomainWordListComponent } from "./domainWordList.component"

@Component({ selector: "cc-domain-word-occurrence-tree", template: "", standalone: true })
class StubOccurrenceTreeComponent {
    readonly word = input.required<string>()
    readonly selectedNodePath = input<string | null>(null)
    readonly nodeClicked = output<string>()
}

const WORDS: DomainLensData = {
    "/root": [
        { text: "invoice", frequency: 10 },
        { text: "payment", frequency: 40 },
        { text: "prepayment", frequency: 4 }
    ]
}

function listedWords(): string[] {
    return [...document.querySelectorAll("cc-domain-word-row .node-name")].map(name => name.textContent?.trim() ?? "")
}

describe("DomainWordListComponent", () => {
    const wordToggled = jest.fn()
    const nodeClicked = jest.fn()

    async function setup(
        inputs: { query?: string; expandedWord?: string | null; sorting?: WordSorting } = {},
        words: DomainLensData = WORDS
    ) {
        jest.clearAllMocks()
        TestBed.overrideComponent(DomainWordListComponent, { set: { imports: [DomainWordRowComponent, StubOccurrenceTreeComponent] } })
        return render(DomainWordListComponent, {
            inputs: { query: "", expandedWord: null, ...inputs },
            on: { wordToggled, nodeClicked },
            providers: [provideMockStore({ initialState: { ...STATE, domainLensSource: { words } } as CcState })]
        })
    }

    it("should list the project's words, most frequent first", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(listedWords()).toEqual(["payment", "invoice", "prepayment"])
    })

    it("should state each word's share of all occurrences and its count, like a metric explorer row does", async () => {
        // Arrange & Act
        await setup()

        // Assert — 40, 10 and 4 of 54 occurrences
        expect(screen.getByText("74% / 40")).toBeTruthy()
        expect(screen.getByText("19% / 10")).toBeTruthy()
        expect(screen.getByText("7% / 4")).toBeTruthy()
    })

    it("should order the words the way the sort control asks for", async () => {
        // Arrange & Act
        await setup({ sorting: { option: WordSortingOption.NAME, ascending: true } })

        // Assert
        expect(listedWords()).toEqual(["invoice", "payment", "prepayment"])
    })

    it("should keep only the words the query matches", async () => {
        // Arrange & Act
        await setup({ query: "pay" })

        // Assert
        expect(listedWords()).toEqual(["payment", "prepayment"])
    })

    it("should explain that no word matches the query", async () => {
        // Arrange & Act
        await setup({ query: "invoicing" })

        // Assert
        expect(screen.getByTestId("domain-word-list-empty").textContent).toContain('No word contains "invoicing"')
    })

    it("should explain that the project carries no words at all", async () => {
        // Arrange & Act
        await setup({}, {})

        // Assert
        expect(screen.getByTestId("domain-word-list-empty").textContent).toContain("carries no words")
    })

    it("should report a clicked word, so the view can expand it", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByTestId("domain-word-row-invoice"))

        // Assert
        expect(wordToggled).toHaveBeenCalledWith("invoice")
    })

    it("should break down only the expanded word", async () => {
        // Arrange & Act
        const { fixture } = await setup({ expandedWord: "invoice" })

        // Assert
        const trees = fixture.nativeElement.querySelectorAll("cc-domain-word-occurrence-tree")
        expect(trees.length).toBe(1)
        expect(screen.getByTestId("domain-word-row-invoice").getAttribute("aria-expanded")).toBe("true")
    })

    it("should break down the expanded word itself", async () => {
        // Arrange & Act
        const { fixture } = await setup({ expandedWord: "invoice" })

        // Assert
        expect(fixture.debugElement.query(By.directive(StubOccurrenceTreeComponent)).componentInstance.word()).toBe("invoice")
    })

    it("should pass on the node its breakdown was clicked on", async () => {
        // Arrange
        const { fixture, detectChanges } = await setup({ expandedWord: "invoice" })

        // Act
        fixture.debugElement.query(By.directive(StubOccurrenceTreeComponent)).componentInstance.nodeClicked.emit("/root/billing")
        detectChanges()

        // Assert
        expect(nodeClicked).toHaveBeenCalledWith("/root/billing")
    })

    it("should give each word a bar as long as its share, so the list can be read by its bars", async () => {
        // Arrange & Act
        await setup()

        // Assert — 40 of 54 occurrences
        const topWordBar = document.querySelector("cc-domain-word-row .bg-primary\\/10") as HTMLElement
        expect(Number.parseFloat(topWordBar.style.width)).toBeCloseTo(74.1, 1)
    })
})
