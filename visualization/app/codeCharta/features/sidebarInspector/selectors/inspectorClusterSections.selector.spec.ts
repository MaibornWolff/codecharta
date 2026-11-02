import { ClusteringsData, CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { _inspectorClusterSections } from "./inspectorClusterSections.selector"

const CLUSTERINGS: ClusteringsData = {
    "author-ownership": {
        title: "Author ownership",
        membership: "weighted",
        clusters: [
            { id: "r-author-1", name: "Author 1", members: { "/root/a": 0.25 } },
            { id: "r-author-2", name: "Author 2", members: { "/root/a": 0.5 } },
            { id: "r-author-3", name: "Author 3", members: { "/root/b": 1 } }
        ]
    }
}
const fileAt = (path: string) => ({ name: path, path, type: NodeType.FILE }) as unknown as CodeMapNode

describe("inspectorClusterSections", () => {
    it("should show the biggest owners of a file with very many and count the others", () => {
        // Arrange
        const clusters = Array.from({ length: 25 }, (_, index) => ({
            id: `c${index}`,
            name: `Commit ${index}`,
            members: { "/root/many": (index + 1) / 100 }
        }))
        const clusterings: ClusteringsData = { commits: { title: "Commits", membership: "overlay", clusters } }

        // Act
        const [section] = _inspectorClusterSections(fileAt("/root/many"), clusterings)

        // Assert
        expect(section.owners).toHaveLength(20)
        expect(section.owners[0].name).toBe("Commit 24")
        expect(section.hiddenOwnerCount).toBe(5)
    })

    it("should list the owners of the selected file, biggest first, and what is not attributed", () => {
        // Arrange & Act
        const [section] = _inspectorClusterSections(fileAt("/root/a"), CLUSTERINGS)

        // Assert
        expect(section.title).toBe("Author ownership")
        expect(section.owners.map(owner => [owner.name, owner.share])).toEqual([
            ["Author 2", 0.5],
            ["Author 1", 0.25]
        ])
        expect(section.notAttributedShare).toBe(0.25)
    })

    it("should give no remainder for an overlay", () => {
        // Arrange
        const overlay: ClusteringsData = {
            suites: { title: "Suites", membership: "overlay", clusters: [{ id: "unit", name: "Unit", members: { "/root/a": 0.5 } }] }
        }

        // Act
        const [section] = _inspectorClusterSections(fileAt("/root/a"), overlay)

        // Assert
        expect(section.notAttributedShare).toBeNull()
    })

    it("should give no section for a folder or for nothing selected", () => {
        // Arrange
        const folder = {
            name: "src",
            path: "/root/src",
            type: NodeType.FOLDER,
            children: [fileAt("/root/src/a")]
        } as unknown as CodeMapNode

        // Act
        const forFolder = _inspectorClusterSections(folder, CLUSTERINGS)
        const forNothing = _inspectorClusterSections(undefined, CLUSTERINGS)

        // Assert
        expect(forFolder).toEqual([])
        expect(forNothing).toEqual([])
    })
})
