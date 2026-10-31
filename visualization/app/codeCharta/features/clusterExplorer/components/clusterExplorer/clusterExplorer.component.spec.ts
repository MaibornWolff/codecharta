import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject, of } from "rxjs"
import { ClusteringsData } from "../../../../model/codeCharta.model"
import { ClusterHighlightService } from "../../services/clusterHighlight.service"
import { ClusterExplorerReadStore } from "../../stores/clusterExplorer.read.store"
import { ClusterExplorerComponent } from "./clusterExplorer.component"

const AUTHORS: ClusteringsData = {
    "author-ownership": {
        title: "Author ownership",
        membership: "weighted",
        clusters: [
            { id: "r-author-1", name: "Author 1", members: { "/root/a": 0.25 } },
            { id: "r-author-2", name: "Author 2", members: { "/root/a": 0.5, "/root/b": 1 } }
        ]
    }
}
const TEAMS: ClusteringsData = {
    teams: { title: "Teams", membership: "overlay", clusters: [{ id: "web", name: "Web", members: { "/root/a": 1 } }] }
}

describe("ClusterExplorerComponent", () => {
    const highlight = { pinnedClusterId: () => null as string | null, hover: jest.fn(), endHover: jest.fn(), togglePin: jest.fn() }

    async function setup(clusterings: ClusteringsData) {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: ClusterExplorerReadStore,
                    useValue: { clusterings$: new BehaviorSubject(clusterings), shownFilePaths$: of(new Set(["/root/a", "/root/b"])) }
                },
                { provide: ClusterHighlightService, useValue: highlight }
            ]
        })
        return render(ClusterExplorerComponent)
    }

    it("should list the clusters by share with what is not attributed, labelled as share of files", async () => {
        // Arrange & Act
        await setup(AUTHORS)

        // Assert
        const rows = screen.getAllByTestId("cluster-explorer-row").map(row => row.textContent?.replace(/\s+/g, " ").trim())
        expect(rows).toEqual(["Author 2 75%", "Author 1 13%"])
        expect(screen.getByTestId("cluster-explorer-not-attributed").textContent).toContain("13%")
        expect(screen.getByText("share of files")).toBeTruthy()
    })

    it("should show the title and no picker with a single clustering", async () => {
        // Arrange & Act
        await setup(AUTHORS)

        // Assert
        expect(screen.getByTestId("cluster-explorer-title").textContent).toBe("Author ownership")
        expect(screen.queryByTestId("cluster-explorer-picker")).toBeNull()
    })

    it("should switch to the clustering picked from the titles", async () => {
        // Arrange
        await setup({ ...AUTHORS, ...TEAMS })

        // Act
        await userEvent.selectOptions(screen.getByTestId("cluster-explorer-picker"), "Teams")

        // Assert
        expect(screen.getAllByTestId("cluster-explorer-row").map(row => row.textContent)).toEqual([expect.stringContaining("Web")])
        expect(screen.queryByTestId("cluster-explorer-not-attributed")).toBeNull()
    })

    it("should light a cluster's shown files on hover and pin them on click", async () => {
        // Arrange
        await setup(AUTHORS)
        const row = screen.getByText(/Author 2/).closest("button") as HTMLElement

        // Act
        await userEvent.hover(row)
        await userEvent.click(row)
        await userEvent.unhover(row)

        // Assert
        expect(highlight.hover).toHaveBeenCalledWith(["/root/a", "/root/b"])
        expect(highlight.togglePin).toHaveBeenCalledWith("r-author-2", ["/root/a", "/root/b"])
        expect(highlight.endHover).toHaveBeenCalled()
    })

    it("should mark the pinned cluster as pressed", async () => {
        // Arrange
        highlight.pinnedClusterId = () => "r-author-1"

        // Act
        await setup(AUTHORS)

        // Assert
        expect(
            screen
                .getByText(/Author 1/)
                .closest("button")
                ?.getAttribute("aria-pressed")
        ).toBe("true")
        expect(
            screen
                .getByText(/Author 2/)
                .closest("button")
                ?.getAttribute("aria-pressed")
        ).toBe("false")
        highlight.pinnedClusterId = () => null
    })

    it("should end a running hover when it goes away", async () => {
        // Arrange
        const { fixture } = await setup(AUTHORS)

        // Act
        fixture.destroy()

        // Assert
        expect(highlight.endHover).toHaveBeenCalled()
    })
})
