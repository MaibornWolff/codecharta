import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { structureTreeSelector } from "../../../../lenses/structure/structure.facade"
import { STATE } from "../../../../mocks/dataMocks"
import { CcState, DomainLensData, NodeType } from "../../../../model/codeCharta.model"
import { DomainWordOccurrenceTreeComponent } from "./domainWordOccurrenceTree.component"

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

function listedNamesOf(container: Element): string[] {
    return [...container.querySelectorAll("cc-domain-word-occurrence-row .node-name")].map(name => name.textContent?.trim() ?? "")
}

describe("DomainWordOccurrenceTreeComponent", () => {
    const nodeClicked = jest.fn()

    async function setup(words: DomainLensData = WORDS, selectedNodePath: string | null = null) {
        jest.clearAllMocks()
        const state = { ...STATE, domainLensSource: { words } } as CcState
        return render(DomainWordOccurrenceTreeComponent, {
            inputs: { word: "invoice", selectedNodePath },
            on: { nodeClicked },
            providers: [
                provideMockStore({
                    initialState: state,
                    selectors: [{ selector: structureTreeSelector, value: { map: TREE, fileMeta: {}, settings: { fileSettings: {} } } }]
                })
            ]
        })
    }

    it("should list the project's top-level nodes the word occurs in, most frequent first", async () => {
        // Arrange & Act
        const { container } = await setup()

        // Assert
        expect(listedNamesOf(container)).toEqual(["billing", "api"])
    })

    it("should state each node's share of the word and its count, the way a metric explorer row does", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("80% / 8")).toBeTruthy()
        expect(screen.getAllByText("20% / 2").length).toBe(1)
    })

    it("should list a folder's children when the folder row is clicked, the way the file tree opens one", async () => {
        // Arrange
        const { container } = await setup()

        // Act
        await userEvent.click(screen.getByText("billing"))

        // Assert
        expect(listedNamesOf(container)).toEqual(["billing", "invoice.ts", "dunning.ts", "api"])
    })

    it("should report a clicked node, so the view can select it", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByText("api"))

        // Assert
        expect(nodeClicked).toHaveBeenCalledWith("/root/api")
    })

    it("should mark the selected node, the way the file tree marks it", async () => {
        // Arrange & Act
        const { container } = await setup(WORDS, "/root/api")

        // Assert
        const selectedNames = [...container.querySelectorAll(".selected .node-name")].map(name => name.textContent?.trim())
        expect(selectedNames).toEqual(["api"])
    })

    it("should explain that the word occurs nowhere", async () => {
        // Arrange & Act
        await setup({})

        // Assert
        expect(screen.getByTestId("domain-word-occurrences-empty").textContent).toContain("invoice does not occur in any file")
    })
})
