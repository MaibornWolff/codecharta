import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"
import { ExplorerFindBarComponent } from "./explorerFindBar.component"

const TREE: CodeMapNode = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: {},
    children: [
        {
            name: "billing",
            path: "/root/billing",
            type: NodeType.FOLDER,
            attributes: {},
            children: [{ name: "payment.ts", path: "/root/billing/payment.ts", type: NodeType.FILE, attributes: {} }]
        },
        { name: "invoice.ts", path: "/root/invoice.ts", type: NodeType.FILE, attributes: {} }
    ]
}

async function setup() {
    const revealNode = jest.fn()
    const view = await render(ExplorerFindBarComponent, {
        providers: [
            { provide: SidebarExplorerReadStore, useValue: { rootNodeFor: () => of(TREE) } },
            { provide: ExplorerRevealService, useValue: { revealNode } }
        ]
    })
    const input = screen.getByLabelText("Find a file or folder in the tree")
    return { ...view, input, revealNode }
}

function type(input: HTMLElement, value: string) {
    fireEvent.input(input, { target: { value } })
    jest.advanceTimersByTime(300)
}

describe("ExplorerFindBarComponent", () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should reveal the first matching node when a query is typed", async () => {
        // Arrange
        const { input, revealNode, detectChanges } = await setup()

        // Act
        type(input, "payment")
        detectChanges()

        // Assert
        expect(revealNode).toHaveBeenCalledWith("/root/billing/payment.ts")
    })

    it("should show the position and count of the matches", async () => {
        // Arrange
        const { input, detectChanges } = await setup()

        // Act — "i" matches billing, invoice.ts (pre-order)
        type(input, "i")
        detectChanges()

        // Assert
        expect(screen.getByTestId("explorer-find-count").textContent.replace(/\s+/g, " ").trim()).toBe("1 / 2")
    })

    it("should step to the next match on Enter", async () => {
        // Arrange
        const { input, revealNode, detectChanges } = await setup()
        type(input, "i")
        detectChanges()

        // Act
        fireEvent.keyDown(input, { key: "Enter" })
        detectChanges()

        // Assert — second match revealed, counter advances
        expect(revealNode).toHaveBeenLastCalledWith("/root/invoice.ts")
        expect(screen.getByTestId("explorer-find-count").textContent.replace(/\s+/g, " ").trim()).toBe("2 / 2")
    })

    it("should report no matches and reveal nothing when the query matches no node", async () => {
        // Arrange
        const { input, revealNode, detectChanges } = await setup()

        // Act
        type(input, "zzz")
        detectChanges()

        // Assert
        expect(screen.getByTestId("explorer-find-count").textContent).toContain("No matches")
        expect(revealNode).not.toHaveBeenCalled()
    })

    it("should clear the query and hide the readout", async () => {
        // Arrange
        const { input, detectChanges } = await setup()
        type(input, "payment")
        detectChanges()

        // Act
        fireEvent.click(screen.getByTestId("explorer-find-clear-button"))
        detectChanges()

        // Assert
        expect(screen.queryByTestId("explorer-find-count")).toBeNull()
    })
})
