import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { structureTreeSelector } from "../../../../lenses/structure/structure.facade"
import { STATE } from "../../../../mocks/dataMocks"
import { CcState, DomainLensData, NodeType } from "../../../../model/codeCharta.model"
import { DomainWordOccurrencesComponent } from "./domainWordOccurrences.component"

const TREE = {
    name: "root",
    type: NodeType.FOLDER,
    path: "/root",
    children: [
        {
            name: "billing",
            type: NodeType.FOLDER,
            path: "/root/billing",
            children: [
                { name: "invoice.ts", type: NodeType.FILE, path: "/root/billing/invoice.ts" },
                { name: "dunning.ts", type: NodeType.FILE, path: "/root/billing/dunning.ts" }
            ]
        },
        {
            name: "api",
            type: NodeType.FOLDER,
            path: "/root/api",
            children: [{ name: "client.ts", type: NodeType.FILE, path: "/root/api/client.ts" }]
        }
    ]
}

const WORDS: DomainLensData = {
    "/root/billing/invoice.ts": [{ text: "invoice", frequency: 6 }],
    "/root/billing/dunning.ts": [{ text: "invoice", frequency: 2 }],
    "/root/api/client.ts": [{ text: "invoice", frequency: 2 }]
}

function revealedPathsOf(container: Element): string[] {
    return [...container.querySelectorAll("[title^='Reveal ']")].map(row => row.getAttribute("title")!.split(" ")[1])
}

describe("DomainWordOccurrencesComponent", () => {
    const closed = jest.fn()
    const revealNode = jest.fn()

    async function setup(words: DomainLensData = WORDS, scopePath: string | null = "/root") {
        jest.clearAllMocks()
        const state = { ...STATE, domainLensSource: { words } } as CcState
        return render(DomainWordOccurrencesComponent, {
            inputs: { word: "invoice", scopePath },
            on: { closed, revealNode },
            providers: [
                provideMockStore({
                    initialState: state,
                    selectors: [{ selector: structureTreeSelector, value: { map: TREE, fileMeta: {}, settings: { fileSettings: {} } } }]
                })
            ]
        })
    }

    it("should summarise the word's occurrences in scope", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("10 occurrences in root")).toBeTruthy()
    })

    it("should list the nodes the word occurs in, most frequent first", async () => {
        // Arrange & Act
        const { container } = await setup()

        // Assert
        expect(revealedPathsOf(container)).toEqual([
            "/root/billing",
            "/root/billing/invoice.ts",
            "/root/billing/dunning.ts",
            "/root/api",
            "/root/api/client.ts"
        ])
    })

    it("should show each node's share of the word", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getAllByText("80%").length).toBe(1)
        expect(screen.getAllByText("20%").length).toBe(3)
    })

    it("should collapse a folder when its chevron is clicked", async () => {
        // Arrange
        const { container } = await setup()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Collapse billing" }))

        // Assert
        expect(revealedPathsOf(container)).toEqual(["/root/billing", "/root/api", "/root/api/client.ts"])
    })

    it("should ask for a node to be revealed when its row is clicked", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByTitle("Reveal /root/api in the explorer"))

        // Assert
        expect(revealNode).toHaveBeenCalledWith("/root/api")
    })

    it("should report that it was closed", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Close occurrences" }))

        // Assert
        expect(closed).toHaveBeenCalled()
    })

    it("should explain that the word occurs nowhere in scope", async () => {
        // Arrange & Act
        await setup({})

        // Assert
        expect(screen.getByTestId("domain-word-occurrences-empty").textContent).toContain("invoice does not occur anywhere below root")
    })
})
