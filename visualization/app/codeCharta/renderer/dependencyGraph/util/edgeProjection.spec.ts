import { DependencyLeafEdge, Edge } from "../../../model/codeCharta.model"
import { DependencyHierarchy } from "../../../model/dependencyGraph.model"
import { projectEdges, visibleRepresentatives } from "./edgeProjection"
import { LeveledNode } from "./leveledTree"

function leveledFile(path: string): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "file", children: [] }
}

function leveledFolder(path: string, children: LeveledNode[]): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "folder", children }
}

function leveledDeclaration(filePath: string, name: string): LeveledNode {
    return { path: `${filePath}/${name}`, name, level: 0, kind: "declaration", children: [], declarationKind: "class" }
}

function fileDeclaring(path: string, names: string[]): LeveledNode {
    return { ...leveledFile(path), children: names.map(name => leveledDeclaration(path, name)) }
}

function leafEdge(from: string, to: string, extra: Partial<DependencyLeafEdge> = {}): DependencyLeafEdge {
    const [fromNodeName, fromLeaf] = from.split("#")
    const [toNodeName, toLeaf] = to.split("#")
    return { fromNodeName, fromLeaf, toNodeName, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], ...extra }
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
                {
                    id: "/root/ui/view.ts|/root/model",
                    fromPath: "/root/ui/view.ts",
                    toPath: "/root/model",
                    weight: 3,
                    type: "cyclic",
                    declarationEdges: []
                }
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
                    type: "regular",
                    declarationEdges: []
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
    describe("projectEdges with declarations", () => {
        const VIEW = "/root/ui/view.ts"
        const NODE = "/root/model/node.ts"
        const declaringTree = leveledFolder("/root", [
            leveledFolder("/root/ui", [fileDeclaring(VIEW, ["View", "Menu"])]),
            leveledFolder("/root/model", [fileDeclaring(NODE, ["Node", "Edge"])])
        ])
        const fileEdges = [edge(VIEW, NODE, { attributes: { dependencies: 5 }, isPointingUpwards: true })]
        const leafEdges = [
            leafEdge(`${VIEW}#View`, `${NODE}#Node`, { isCyclic: true }),
            leafEdge(`${VIEW}#Menu`, `${NODE}#Node`, { attributes: { dependencies: 2 } }),
            leafEdge(`${VIEW}#View`, `${VIEW}#Menu`, { isPointingUpwards: true })
        ]
        const everyFolder = ["/root", "/root/ui", "/root/model"]

        function project(openedFiles: string[], edgeMetric = "dependencies", hierarchy: DependencyHierarchy = "folders") {
            const representatives = visibleRepresentatives(declaringTree, new Set([...everyFolder, ...openedFiles]))
            return projectEdges(fileEdges, representatives, edgeMetric, { leafEdges, hierarchy })
        }

        it("should keep the file edge between two closed files and say which declaration edges it stands for", () => {
            // Arrange
            const openedFiles: string[] = []

            // Act
            const projected = project(openedFiles)

            // Assert
            expect(projected).toEqual([
                {
                    id: `${VIEW}|${NODE}`,
                    fromPath: VIEW,
                    toPath: NODE,
                    weight: 5,
                    type: "feedbackContainerLevel",
                    declarationEdges: [leafEdges[0], leafEdges[1]]
                }
            ])
        })

        it("should show the declaration edges of an opened file, lifted onto the closed file at their other end", () => {
            // Arrange
            const openedFiles = [VIEW]

            // Act
            const projected = project(openedFiles)

            // Assert
            expect(projected.map(({ id, weight }) => [id, weight])).toEqual([
                [`${VIEW}/View|${NODE}`, 1],
                [`${VIEW}/Menu|${NODE}`, 2],
                [`${VIEW}/View|${VIEW}/Menu`, 1]
            ])
        })

        it("should take which way is up from the file edge between two files and from the declaration edge inside one", () => {
            // Arrange
            const openedFiles = [VIEW, NODE]

            // Act
            const projected = project(openedFiles)

            // Assert
            expect(projected.map(({ id, type }) => [id, type])).toEqual([
                [`${VIEW}/View|${NODE}/Node`, "feedbackLeafLevel"],
                [`${VIEW}/Menu|${NODE}/Node`, "feedbackContainerLevel"],
                [`${VIEW}/View|${VIEW}/Menu`, "feedbackContainerLevel"]
            ])
        })

        it("should merge the declaration edges that land on the same declaration of the other file", () => {
            // Arrange
            const openedFiles = [NODE]

            // Act
            const projected = project(openedFiles)

            // Assert
            expect(projected).toHaveLength(1)
            expect(projected[0]).toMatchObject({ id: `${VIEW}|${NODE}/Node`, weight: 3, type: "feedbackLeafLevel" })
            expect(projected[0].declarationEdges).toHaveLength(2)
        })

        it("should keep an edge inside a file hidden while the file is closed", () => {
            // Arrange
            const everythingClosed = new Set(["/root"])

            // Act
            const projected = projectEdges(fileEdges, visibleRepresentatives(declaringTree, everythingClosed), "dependencies", {
                leafEdges,
                hierarchy: "folders"
            })

            // Assert
            expect(projected.map(({ id }) => id)).toEqual(["/root/ui|/root/model"])
        })

        it("should end the file edge on the opened file when no declaration edge tells more", () => {
            // Arrange
            const representatives = visibleRepresentatives(declaringTree, new Set([...everyFolder, VIEW]))

            // Act
            const projected = projectEdges(fileEdges, representatives, "dependencies", { leafEdges: [], hierarchy: "folders" })

            // Assert
            expect(projected.map(({ id }) => id)).toEqual([`${VIEW}|${NODE}`])
        })

        it("should stand a declaration the tree does not hold by its file, and weigh an edge without a weight as one", () => {
            // Arrange
            const representatives = visibleRepresentatives(declaringTree, new Set([...everyFolder, VIEW]))
            const toUnknown = [leafEdge(`${VIEW}#View`, `${NODE}#Ghost`, { attributes: {} })]

            // Act
            const projected = projectEdges(fileEdges, representatives, "dependencies", { leafEdges: toUnknown, hierarchy: "folders" })

            // Assert
            expect(projected.map(({ id, weight }) => [id, weight])).toEqual([[`${VIEW}/View|${NODE}`, 1]])
        })

        it("should take the flags and the weight of an edge between two closed files from its declaration edges among packages", () => {
            // Arrange
            const openedFiles: string[] = []

            // Act
            const [amongFolders] = project(openedFiles)
            const [amongPackages] = project(openedFiles, "dependencies", "packages")

            // Assert
            expect(amongFolders).toMatchObject({ weight: 5, type: "feedbackContainerLevel" })
            expect(amongPackages).toMatchObject({ id: `${VIEW}|${NODE}`, weight: 3, type: "cyclic" })
            expect(amongPackages.declarationEdges).toHaveLength(2)
        })

        it("should keep a file edge no declaration edge tells more about, among packages too", () => {
            // Arrange
            const representatives = visibleRepresentatives(declaringTree, new Set(everyFolder))

            // Act
            const projected = projectEdges(fileEdges, representatives, "dependencies", { leafEdges: [], hierarchy: "packages" })

            // Assert
            expect(projected).toMatchObject([{ weight: 5, type: "feedbackContainerLevel" }])
        })

        it("should leave the declarations out of another edge metric", () => {
            // Arrange
            const openedFiles = [VIEW, NODE]

            // Act
            const projected = project(openedFiles, "temporal_coupling")

            // Assert
            expect(projected).toEqual([])
        })
    })
})
