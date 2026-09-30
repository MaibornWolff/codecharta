import { Edge } from "../../../model/codeCharta.model"
import { projectEdges, visibleRepresentatives } from "./edgeProjection"
import { LeveledNode } from "./leveledTree"

function leveledFile(path: string): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, isFolder: false, children: [] }
}

function leveledFolder(path: string, children: LeveledNode[]): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, isFolder: true, children }
}

function edge(fromNodeName: string, toNodeName: string, extra: Partial<Edge> = {}): Edge {
    return { fromNodeName, toNodeName, attributes: { dependencies: 1 }, ...extra }
}

const tree = leveledFolder("/root", [
    leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts"), leveledFile("/root/ui/menu.ts")]),
    leveledFolder("/root/model", [leveledFile("/root/model/node.ts"), leveledFile("/root/model/edge.ts")])
])

describe("edgeProjection", () => {
    describe("visibleRepresentatives", () => {
        it("should map the paths inside a closed folder onto that folder", () => {
            // Arrange
            const expanded = new Set(["/root", "/root/ui"])

            // Act
            const representatives = visibleRepresentatives(tree, expanded)

            // Assert
            expect(representatives.get("/root/ui/view.ts")).toBe("/root/ui/view.ts")
            expect(representatives.get("/root/model/node.ts")).toBe("/root/model")
            expect(representatives.get("/root/model")).toBe("/root/model")
        })

        it("should map the folders folded into a chain box onto the box standing for it", () => {
            // Arrange
            const chain = { ...leveledFolder("/root/src/main", [leveledFile("/root/src/main/a.ts")]), foldedPaths: ["/root", "/root/src"] }

            // Act
            const representatives = visibleRepresentatives(chain, new Set())

            // Assert
            expect(representatives.get("/root")).toBe("/root/src/main")
            expect(representatives.get("/root/src")).toBe("/root/src/main")
            expect(representatives.get("/root/src/main/a.ts")).toBe("/root/src/main")
        })

        it("should map the folders folded into a chain box hidden in a closed folder onto that folder", () => {
            // Arrange
            const chain = { ...leveledFolder("/root/ui/src/main", [leveledFile("/root/ui/src/main/a.ts")]), foldedPaths: ["/root/ui/src"] }
            const treeWithChain = leveledFolder("/root", [leveledFolder("/root/ui", [chain, leveledFile("/root/ui/b.ts")])])

            // Act
            const representatives = visibleRepresentatives(treeWithChain, new Set(["/root"]))

            // Assert
            expect(representatives.get("/root/ui/src")).toBe("/root/ui")
        })
    })

    describe("projectEdges", () => {
        it("should lift an edge ending on a folder folded into a chain box onto that box", () => {
            // Arrange
            const chain = { ...leveledFolder("/root/src/main", [leveledFile("/root/src/main/a.ts")]), foldedPaths: ["/root/src"] }
            const representatives = visibleRepresentatives(leveledFolder("/root", [chain, leveledFile("/root/b.ts")]), new Set(["/root"]))

            // Act
            const projected = projectEdges([edge("/root/b.ts", "/root/src")], representatives, "dependencies")

            // Assert
            expect(projected.map(({ fromPath, toPath }) => [fromPath, toPath])).toEqual([["/root/b.ts", "/root/src/main"]])
        })

        it("should merge the edges that land on the same two boxes", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root", "/root/ui"]))
            const edges = [
                edge("/root/ui/view.ts", "/root/model/node.ts", { attributes: { dependencies: 2 } }),
                edge("/root/ui/view.ts", "/root/model/edge.ts", { attributes: { dependencies: 1, temporal_coupling: 0.5 }, isCyclic: true })
            ]

            // Act
            const projected = projectEdges(edges, representatives, "dependencies")

            // Assert
            expect(projected).toEqual([
                { id: "/root/ui/view.ts|/root/model", fromPath: "/root/ui/view.ts", toPath: "/root/model", weight: 3, type: "cyclic" }
            ])
        })

        it("should keep a merged edge pointing upward when any of its parts does", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root"]))
            const edges = [
                edge("/root/model/node.ts", "/root/ui/view.ts"),
                edge("/root/model/edge.ts", "/root/ui/menu.ts", { isPointingUpwards: true })
            ]

            // Act
            const [projected] = projectEdges(edges, representatives, "dependencies")

            // Assert
            expect(projected.type).toBe("feedbackContainerLevel")
        })

        it("should drop edges inside one box and edges to files that are not in the graph", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root"]))
            const edges = [edge("/root/ui/view.ts", "/root/ui/menu.ts"), edge("/root/ui/view.ts", "/root/docs/readme.md")]

            // Act
            const projected = projectEdges(edges, representatives, "dependencies")

            // Assert
            expect(projected).toEqual([])
        })

        it("should draw only the edges carrying the metric, as other producers share the list", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root", "/root/ui", "/root/model"]))
            const edges = [
                edge("/root/ui/view.ts", "/root/model/node.ts"),
                edge("/root/ui/menu.ts", "/root/model/edge.ts", { attributes: { temporal_coupling: 0.4 } })
            ]

            // Act
            const dependencies = projectEdges(edges, representatives, "dependencies")
            const coupling = projectEdges(edges, representatives, "temporal_coupling")

            // Assert
            expect(dependencies.map(projected => projected.id)).toEqual(["/root/ui/view.ts|/root/model/node.ts"])
            expect(coupling).toEqual([
                {
                    id: "/root/ui/menu.ts|/root/model/edge.ts",
                    fromPath: "/root/ui/menu.ts",
                    toPath: "/root/model/edge.ts",
                    weight: 0.4,
                    type: "regular"
                }
            ])
        })

        it("should draw another metric neutral, as the cycle and upward flags describe dependencies only", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root", "/root/ui", "/root/model"]))
            const edges = [
                edge("/root/model/node.ts", "/root/ui/view.ts", {
                    attributes: { dependencies: 1, temporal_coupling: 0.4 },
                    isCyclic: true,
                    isPointingUpwards: true
                })
            ]

            // Act
            const [projected] = projectEdges(edges, representatives, "temporal_coupling")

            // Assert
            expect(projected.type).toBe("regular")
        })

        it("should draw nothing while the map has no edge metric", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root", "/root/ui", "/root/model"]))

            // Act
            const projected = projectEdges([edge("/root/ui/view.ts", "/root/model/node.ts")], representatives, null)

            // Assert
            expect(projected).toEqual([])
        })
    })
})
