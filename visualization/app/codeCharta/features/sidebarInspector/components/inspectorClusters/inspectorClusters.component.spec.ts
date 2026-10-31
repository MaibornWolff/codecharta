import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { InspectorClusterSection } from "../../selectors/inspectorClusterSections.selector"
import { SidebarInspectorReadStore } from "../../stores/sidebarInspector.read.store"
import { InspectorClustersComponent } from "./inspectorClusters.component"

const SECTION: InspectorClusterSection = {
    key: "author-ownership",
    title: "Author ownership",
    owners: [{ id: "r-author-3", name: "Author 3", repositoryMarker: "a1b2c3d", share: 0.625 }],
    notAttributedShare: 0.375
}

describe("InspectorClustersComponent", () => {
    async function setup(sections: InspectorClusterSection[]) {
        TestBed.configureTestingModule({
            providers: [{ provide: SidebarInspectorReadStore, useValue: { clusterSections$: of(sections) } }]
        })
        await render(InspectorClustersComponent)
    }

    it("should show the owners of the file and what is not attributed", async () => {
        // Arrange & Act
        await setup([SECTION])

        // Assert
        expect(screen.getByText("Author ownership")).toBeTruthy()
        expect(screen.getByTestId("inspector-cluster-owner").textContent?.replace(/\s+/g, " ").trim()).toBe("Author 3 a1b2c3d63%")
        expect(screen.getByTestId("inspector-cluster-not-attributed").textContent).toContain("38%")
    })

    it("should hide a fully attributed remainder", async () => {
        // Arrange & Act
        await setup([{ ...SECTION, notAttributedShare: 0 }])

        // Assert
        expect(screen.queryByTestId("inspector-cluster-not-attributed")).toBeNull()
    })

    it("should show nothing without a section", async () => {
        // Arrange & Act
        await setup([])

        // Assert
        expect(screen.queryByTestId("inspector-clusters")).toBeNull()
    })
})
