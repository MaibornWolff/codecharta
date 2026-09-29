import { Edge } from "../../../model/codeCharta.model"
import { effectiveEdgeFilter, isShownByFilter, projectEdges, visibleRepresentatives } from "./edgeProjection"
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
    })

    describe("projectEdges", () => {
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

    describe("effectiveEdgeFilter", () => {
        it("should keep every filter for dependencies, and show all edges of another metric instead of its cycles or upward edges", () => {
            // Act
            const forDependencies = (["cycles", "feedback"] as const).map(filter => effectiveEdgeFilter(filter, "dependencies"))
            const forCoupling = (["all", "cycles", "feedback", "none"] as const).map(filter =>
                effectiveEdgeFilter(filter, "temporal_coupling")
            )

            // Assert
            expect(forDependencies).toEqual(["cycles", "feedback"])
            expect(forCoupling).toEqual(["all", "all", "all", "none"])
        })
    })

    describe("isShownByFilter", () => {
        it.each([
            ["none", "feedbackLeafLevel", false],
            ["all", "regular", true],
            ["cycles", "cyclic", true],
            ["cycles", "feedbackContainerLevel", false],
            ["feedback", "feedbackContainerLevel", true],
            ["feedback", "cyclic", false]
        ] as const)("should decide for filter %s and type %s", (filter, type, expected) => {
            // Arrange + Act
            const isShown = isShownByFilter(type, filter)

            // Assert
            expect(isShown).toBe(expected)
        })
    })
})
