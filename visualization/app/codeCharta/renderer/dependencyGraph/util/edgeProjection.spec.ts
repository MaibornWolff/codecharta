import { Edge } from "../../../model/codeCharta.model"
import { isShownByFilter, projectEdges, visibleRepresentatives } from "./edgeProjection"
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
                edge("/root/ui/view.ts", "/root/model/edge.ts", { isCyclic: true })
            ]

            // Act
            const projected = projectEdges(edges, representatives)

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
            const [projected] = projectEdges(edges, representatives)

            // Assert
            expect(projected.type).toBe("feedbackContainerLevel")
        })

        it("should drop edges inside one box and edges to files that are not in the graph", () => {
            // Arrange
            const representatives = visibleRepresentatives(tree, new Set(["/root"]))
            const edges = [edge("/root/ui/view.ts", "/root/ui/menu.ts"), edge("/root/ui/view.ts", "/root/docs/readme.md")]

            // Act
            const projected = projectEdges(edges, representatives)

            // Assert
            expect(projected).toEqual([])
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
