import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject, of } from "rxjs"
import { ClusteringsData } from "../../../../model/codeCharta.model"
import { ExplorerScrollHostService } from "../../../sidebarExplorer/facade"
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
const COMMITS: ClusteringsData = {
    "commit-changes": {
        title: "Commit changes",
        membership: "overlay",
        attributeTitles: { date: "Date", changed_lines: "Lines changed" },
        clusters: [
            { id: "old", name: "aaa1111 Old and big", members: { "/root/a": 1 }, attributes: { date: "2025-01-01", changed_lines: 900 } },
            { id: "new", name: "bbb2222 New and small", members: { "/root/a": 0.5 }, attributes: { date: "2026-01-01", changed_lines: 2 } }
        ]
    }
}
const clusteringOfSize = (clusterCount: number): ClusteringsData => ({
    many: {
        title: "Many",
        membership: "overlay",
        clusters: Array.from({ length: clusterCount }, (_, index) => ({
            id: `c${index}`,
            name: `Cluster ${index}`,
            members: { "/root/a": 1 }
        }))
    }
})
const TEAMS: ClusteringsData = {
    teams: { title: "Teams", membership: "overlay", clusters: [{ id: "web", name: "Web", members: { "/root/a": 1 } }] }
}

describe("ClusterExplorerComponent", () => {
    const isOnMap = signal<(path: string) => boolean>(() => true)
    const highlight = {
        pinnedClusterId: () => null as string | null,
        isOnMap,
        hover: jest.fn(),
        endHover: jest.fn(),
        togglePin: jest.fn()
    }

    async function setup(clusterings: ClusteringsData, areaMetric = "rloc") {
        jest.clearAllMocks()
        isOnMap.set(() => true)
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: ClusterExplorerReadStore,
                    useValue: {
                        clusterings$: new BehaviorSubject(clusterings),
                        shownFiles$: of(
                            new Map([
                                ["/root/a", { loc: 30 }],
                                ["/root/b", { loc: 10 }]
                            ])
                        ),
                        areaMetric$: of(areaMetric)
                    }
                },
                { provide: ClusterHighlightService, useValue: highlight },
                ExplorerScrollHostService
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

    it("should label the shares as share of lines where the clustering is weighted by lines", async () => {
        // Arrange & Act
        await setup({ authors: { ...AUTHORS["author-ownership"], weightBasis: "loc" } })

        // Assert
        expect(screen.getByTestId("cluster-explorer-share-label").textContent).toBe("share of lines")
    })

    it("should measure the shares by the area metric where the shown files hold it", async () => {
        // Arrange & Act
        await setup(AUTHORS, "loc")

        // Assert
        expect(screen.getByTestId("cluster-explorer-share-label").textContent).toBe("share of lines")
    })

    it("should name the share's sort option after what it measures", async () => {
        // Arrange & Act
        await setup({ commits: { ...COMMITS["commit-changes"], weightBasis: "loc" } })

        // Assert
        const options = within(screen.getByTestId("cluster-explorer-sort")).getAllByRole("option")
        expect(options.map(option => option.textContent)).toEqual(["Share of lines", "Date", "Lines changed"])
    })

    const rowTexts = () => screen.getAllByTestId("cluster-explorer-row").map(row => row.textContent?.replace(/\s+/g, " ").trim())

    it("should show each cluster's attributes by their titles", async () => {
        // Arrange & Act
        await setup(COMMITS)

        // Assert
        expect(rowTexts()[0]).toContain("Date: 2025-01-01 · Lines changed: 900")
        expect(screen.getAllByTestId("cluster-explorer-row")[0].getAttribute("title")).toContain("Lines changed: 900")
    })

    it("should sort by a picked attribute", async () => {
        // Arrange
        await setup(COMMITS)

        // Act
        await userEvent.selectOptions(screen.getByTestId("cluster-explorer-sort"), "Date")

        // Assert
        expect(rowTexts()[0]).toContain("New and small")
    })

    it("should offer no sorting and no filter for a short list without attributes", async () => {
        // Arrange & Act
        await setup(AUTHORS)

        // Assert
        expect(screen.queryByTestId("cluster-explorer-sort")).toBeNull()
        expect(screen.queryByTestId("cluster-explorer-filter")).toBeNull()
        expect(screen.queryByTestId("cluster-explorer-attributes")).toBeNull()
    })

    it("should filter a long list by name and say when nothing matches", async () => {
        // Arrange
        await setup(clusteringOfSize(11))

        // Act
        await userEvent.type(screen.getByTestId("cluster-explorer-filter"), "cluster 10")

        // Assert
        expect(rowTexts()).toEqual(["Cluster 10 50%"])

        // Act
        await userEvent.type(screen.getByTestId("cluster-explorer-filter"), "x")

        // Assert
        expect(screen.queryByTestId("cluster-explorer-row")).toBeNull()
        expect(screen.getByTestId("cluster-explorer-no-match").textContent).toContain("cluster 10x")
        expect(screen.getByTestId("cluster-explorer-filter")).toBeTruthy()
    })

    it("should end a running hover when the filter changes, as the row may go away", async () => {
        // Arrange
        await setup(clusteringOfSize(11))

        // Act
        await userEvent.type(screen.getByTestId("cluster-explorer-filter"), "1")

        // Assert
        expect(highlight.endHover).toHaveBeenCalled()
    })

    it("should clear the filter when another clustering is picked", async () => {
        // Arrange
        await setup({ ...clusteringOfSize(11), ...TEAMS })
        await userEvent.selectOptions(screen.getByTestId("cluster-explorer-picker"), "Many")
        await userEvent.type(screen.getByTestId("cluster-explorer-filter"), "nothing like it")

        // Act
        await userEvent.selectOptions(screen.getByTestId("cluster-explorer-picker"), "Teams")

        // Assert
        expect(rowTexts()).toEqual(["Web 50%"])
    })

    it("should render only a slice of a very long list", async () => {
        // Arrange & Act
        await setup(clusteringOfSize(5000))

        // Assert
        expect(screen.getAllByTestId("cluster-explorer-row").length).toBeLessThan(100)
    })

    it("should fold the clusters none of whose shown files is on the map into one closed group with their share", async () => {
        // Arrange
        const { detectChanges } = await setup(AUTHORS)

        // Act
        isOnMap.set(path => path === "/root/b")
        detectChanges()

        // Assert
        expect(rowTexts()).toEqual(["Author 2 75%"])
        const group = screen.getByTestId("cluster-explorer-off-map-group")
        expect(group.textContent?.replace(/\s+/g, " ").trim()).toBe("Not on the map (1) 13%")
        expect(group.getAttribute("aria-expanded")).toBe("false")
    })

    it("should list the clusters of the group once it is opened", async () => {
        // Arrange
        const { detectChanges } = await setup(AUTHORS)
        isOnMap.set(path => path === "/root/b")
        detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("cluster-explorer-off-map-group"))

        // Assert
        expect(rowTexts()).toEqual(["Author 2 75%", "Author 1 13%"])
        expect(screen.getAllByTestId("cluster-explorer-row")[1].getAttribute("title")).toBe("Author 1\n1 file, none of them on the map")
        expect(screen.getByTestId("cluster-explorer-off-map-group").getAttribute("aria-expanded")).toBe("true")
    })

    it("should give the group no share where the shares overlap", async () => {
        // Arrange
        const { detectChanges } = await setup(COMMITS)

        // Act
        isOnMap.set(() => false)
        detectChanges()

        // Assert
        expect(screen.getByTestId("cluster-explorer-off-map-group").textContent?.replace(/\s+/g, " ").trim()).toBe("Not on the map (2)")
    })

    it("should drop the group once every cluster is back on the map", async () => {
        // Arrange
        const { detectChanges } = await setup(AUTHORS)
        isOnMap.set(() => false)
        detectChanges()
        const groupWhileOff = screen.queryByTestId("cluster-explorer-off-map-group")

        // Act
        isOnMap.set(() => true)
        detectChanges()

        // Assert
        expect(groupWhileOff).not.toBeNull()
        expect(screen.queryByTestId("cluster-explorer-off-map-group")).toBeNull()
        expect(rowTexts()).toEqual(["Author 2 75%", "Author 1 13%"])
    })

    it("should show the title and no picker with a single clustering", async () => {
        // Arrange & Act
        await setup(AUTHORS)

        // Assert
        expect(screen.getByTestId("cluster-explorer-title").textContent).toBe("Author ownership")
        expect(screen.queryByTestId("cluster-explorer-picker")).toBeNull()
    })

    it("should label the clustering picker with visible text", async () => {
        // Arrange
        await setup({ ...AUTHORS, ...TEAMS })

        // Act
        const picker = screen.getByLabelText("Clustering")

        // Assert
        expect(picker).toBe(screen.getByTestId("cluster-explorer-picker"))
        expect(picker.hasAttribute("aria-label")).toBe(false)
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

    it("should give only the pinned cluster a primary border", async () => {
        // Arrange
        highlight.pinnedClusterId = () => "r-author-1"

        // Act
        await setup(AUTHORS)

        // Assert
        expect(screen.getByText(/Author 1/).closest("button")?.classList).toContain("border-primary")
        expect(screen.getByText(/Author 2/).closest("button")?.classList).not.toContain("border-primary")
        highlight.pinnedClusterId = () => null
    })

    it("should warn only when the clustering shows real names", async () => {
        // Arrange
        const withNames: ClusteringsData = { "author-ownership-with-names": AUTHORS["author-ownership"] }

        // Act
        await setup(withNames)

        // Assert
        expect(screen.getByTestId("cluster-explorer-real-names").textContent).toContain("real author names")
    })

    it("should warn while a numbered clustering is open if the map also holds real names", async () => {
        // Arrange & Act
        await setup({ ...AUTHORS, "author-ownership-with-names": { ...AUTHORS["author-ownership"], title: "Z real names" } })

        // Assert
        expect((screen.getByTestId("cluster-explorer-picker") as HTMLSelectElement).value).toBe("author-ownership")
        expect(screen.getByTestId("cluster-explorer-real-names")).toBeTruthy()
    })

    it("should not warn about numbered authors", async () => {
        // Arrange & Act
        await setup(AUTHORS)

        // Assert
        expect(screen.queryByTestId("cluster-explorer-real-names")).toBeNull()
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
