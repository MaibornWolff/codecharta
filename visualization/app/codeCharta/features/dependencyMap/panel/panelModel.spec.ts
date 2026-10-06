import { DependencyDeclarations } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { GraphEdge, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { indexDeclarations } from "./declarationIndex"
import { describeSubject, PanelContext, PanelModel } from "./panelModel"

const CREATURE = "/root/game/creature.ts"
const WEAPON = "/root/game/weapon.ts"
const UTIL = "/root/util/text.ts"

function leafEdge(from: string, to: string, extra: Partial<DependencyLeafEdge> = {}): DependencyLeafEdge {
    const [fromNodeName, fromLeaf] = from.split("#")
    const [toNodeName, toLeaf] = to.split("#")
    return { fromNodeName, fromLeaf, toNodeName, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], ...extra }
}

const LEAF_EDGES = [
    leafEdge(`${CREATURE}#Creature`, `${WEAPON}#Weapon`, { usage: ["inheritance", "usage"], isCyclic: true }),
    leafEdge(`${WEAPON}#Weapon`, `${CREATURE}#Creature`, { isCyclic: true, isPointingUpwards: true }),
    leafEdge(`${CREATURE}#Creature`, `${CREATURE}#Armor`),
    leafEdge(`${CREATURE}#Armor`, `${UTIL}#format`, { usage: ["argument"] }),
    leafEdge(`${CREATURE}#Creature`, "/root/gone.ts#Ghost")
]

const DECLARATIONS: Pick<DependencyDeclarations, "leaves" | "leafEdges"> = {
    leaves: {
        [CREATURE]: {
            Creature: { name: "Creature", kind: "class", namespace: "game", level: 1 },
            Armor: { name: "Armor", kind: "valueclass", namespace: "game" }
        },
        [WEAPON]: { Weapon: { name: "Weapon", kind: "interface" } },
        [UTIL]: { format: { name: "format", kind: "function" } }
    },
    leafEdges: LEAF_EDGES
}

function declarationNode(filePath: string, name: string, declarationKind: string): LeveledNode {
    return { path: `${filePath}/${name}`, name, level: 0, kind: "declaration", children: [], declarationKind }
}

function fileNode(path: string, declarations: LeveledNode[] = []): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "file", children: declarations }
}

const CREATURE_NODE = fileNode(CREATURE, [declarationNode(CREATURE, "Creature", "class"), declarationNode(CREATURE, "Armor", "valueclass")])
const GAME_FOLDER: LeveledNode = {
    path: "/root/game",
    name: "game",
    level: 0,
    kind: "folder",
    children: [CREATURE_NODE, fileNode(WEAPON, [declarationNode(WEAPON, "Weapon", "interface")])]
}

function context(rowLimit = 20): PanelContext {
    return { index: indexDeclarations(DECLARATIONS), rowLimit }
}

function box(node: LeveledNode, isOpen = false) {
    return { kind: "box", node, isOpen } as const
}

function rowsOf(model: PanelModel, title: string): string[] {
    const section = model.sections.find(candidate => candidate.title === title)
    return section.groups.flatMap(group =>
        group.dependencies.map(row => `${group.heading?.name ?? "-"}: ${row.from.name} → ${row.to.name} (${row.usages.join(", ")})`)
    )
}

describe("describeSubject", () => {
    describe("a file", () => {
        it("should tell its folder, its package and its declarations by name", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context())

            // Assert
            expect(model).toMatchObject({ kind: "file", title: "creature.ts", subtitle: "File", path: CREATURE })
            expect(model.facts).toEqual([
                { label: "Folder", value: "/root/game", ref: { path: "/root/game", name: "game", kind: "folder" } },
                { label: "Package", value: "game" }
            ])
            expect(model.lists).toEqual([
                {
                    title: "Declarations",
                    count: 2,
                    hiddenCount: 0,
                    refs: [
                        { path: `${CREATURE}/Armor`, name: "Armor", kind: "declaration", declarationKind: "valueclass" },
                        { path: `${CREATURE}/Creature`, name: "Creature", kind: "declaration", declarationKind: "class" }
                    ]
                }
            ])
        })

        it("should tell the dependencies inside it apart from those it uses and is used by, grouped by the other file", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context())

            // Assert
            expect(rowsOf(model, "Inside the file")).toEqual(["-: Creature → Armor (Uses)"])
            expect(rowsOf(model, "Uses")).toEqual([
                "weapon.ts: Creature → Weapon (Inherits, Uses)",
                "text.ts: Armor → format (Takes as argument)"
            ])
            expect(rowsOf(model, "Used by")).toEqual(["weapon.ts: Weapon → Creature (Uses)"])
            expect(model.sections.map(section => section.count)).toEqual([1, 2, 1])
        })

        it("should carry the flags and the dependency of each row, for the graph to light up", () => {
            // Act
            const [usedBy] = describeSubject(box(CREATURE_NODE), context()).sections[2].groups[0].dependencies

            // Assert
            expect(usedBy).toMatchObject({ isCyclic: true, isPointingUpwards: true, leafEdge: LEAF_EDGES[1] })
        })

        it("should offer to open a closed file and to close an open one, and neither for a file telling no declaration", () => {
            // Act
            const actions = [box(CREATURE_NODE), box(CREATURE_NODE, true), box(fileNode("/root/plain.ts"))].map(
                subject => describeSubject(subject, context()).action
            )

            // Assert
            expect(actions).toEqual(["open", "close", null])
        })

        it("should tell its cycles as the declarations walked, back to the first", () => {
            // Act
            const { cycles } = describeSubject(box(CREATURE_NODE), context())

            // Assert
            expect(cycles.map(cycle => cycle.steps.map(step => step.name))).toEqual([["Creature", "Weapon", "Creature"]])
            expect(cycles[0].leafEdges).toEqual([LEAF_EDGES[0], LEAF_EDGES[1]])
        })

        it("should cut a hub's rows and say how many it left out", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context(1))

            // Assert
            expect(model.lists[0]).toMatchObject({ count: 2, hiddenCount: 1 })
            expect(model.lists[0].refs).toHaveLength(1)
            expect(model.sections[1].groups.map(group => group.hiddenCount)).toEqual([0, 0])
        })
    })

    describe("a declaration", () => {
        it("should tell its kind, file, package and level", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE.children[0]), context())

            // Assert
            expect(model).toMatchObject({ kind: "declaration", title: "Creature", subtitle: "Class", action: null })
            expect(model.facts).toEqual([
                { label: "File", value: "creature.ts", ref: { path: CREATURE, name: "creature.ts", kind: "file" } },
                { label: "Package", value: "game" },
                { label: "Level", value: "1" }
            ])
        })

        it("should tell what it uses and what uses it, its own file among the others, and its cycles", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE.children[0]), context())

            // Assert
            expect(rowsOf(model, "Uses")).toEqual(["creature.ts: Creature → Armor (Uses)", "weapon.ts: Creature → Weapon (Inherits, Uses)"])
            expect(rowsOf(model, "Used by")).toEqual(["weapon.ts: Weapon → Creature (Uses)"])
            expect(model.cycles).toHaveLength(1)
        })

        it("should leave out the package and level a declaration does not have, and say nothing of one the map does not tell", () => {
            // Act
            const weapon = describeSubject(box(declarationNode(WEAPON, "Weapon", "interface")), context())
            const untold = describeSubject(box(declarationNode(WEAPON, "Ghost", "typealias")), context())

            // Assert
            expect(weapon.facts.map(fact => fact.label)).toEqual(["File"])
            expect(untold).toMatchObject({ subtitle: "typealias", facts: [], cycles: [] })
        })
    })

    describe("a folder", () => {
        it("should count its files and declarations and the cyclic and upward dependencies touching them, and list the files", () => {
            // Act
            const model = describeSubject(box(GAME_FOLDER), context())

            // Assert
            expect(model).toMatchObject({ kind: "folder", title: "game", subtitle: "Folder", sections: [], action: null })
            expect(model.facts).toEqual([
                { label: "Files", value: "2" },
                { label: "Declarations", value: "3" },
                { label: "Cyclic dependencies", value: "2" },
                { label: "Upward dependencies", value: "1" }
            ])
            expect(model.lists[0].refs.map(ref => ref.name)).toEqual(["creature.ts", "weapon.ts"])
            expect(model.cycles).toHaveLength(1)
        })
    })

    describe("a package", () => {
        it("should be told as a folder is, by what it holds", () => {
            // Arrange
            const gamePackage: LeveledNode = { ...GAME_FOLDER, path: "package:game", kind: "package" }

            // Act
            const model = describeSubject(box(gamePackage), context())

            // Assert
            expect(model).toMatchObject({ title: "game", subtitle: "Package", path: "package:game" })
            expect(model.facts[0]).toEqual({ label: "Files", value: "2" })
        })
    })

    describe("an edge", () => {
        const edge: GraphEdge = {
            id: `${CREATURE}|${WEAPON}`,
            fromPath: CREATURE,
            toPath: WEAPON,
            weight: 3,
            type: "cyclic",
            declarationEdges: [LEAF_EDGES[0], LEAF_EDGES[3]]
        }

        it("should tell the dependencies it stands for and count them per kind of use, the most frequent first", () => {
            // Act
            const model = describeSubject({ kind: "edge", edge, fromName: "creature.ts", toName: "weapon.ts" }, context())

            // Assert
            expect(model).toMatchObject({ kind: "edge", title: "creature.ts → weapon.ts", subtitle: "Dependency", path: edge.id })
            expect(model.facts).toEqual([
                { label: "Dependencies", value: "3" },
                { label: "Takes as argument", value: "1" },
                { label: "Inherits", value: "1" },
                { label: "Uses", value: "1" }
            ])
            expect(rowsOf(model, "Stands for")).toEqual(["-: Armor → format (Takes as argument)", "-: Creature → Weapon (Inherits, Uses)"])
        })

        it("should offer to unfold it unless both ends are declarations already or the map tells none", () => {
            // Arrange
            const unfolded = { ...edge, fromPath: `${CREATURE}/Creature`, toPath: `${WEAPON}/Weapon` }
            const untold = { ...edge, declarationEdges: [] }

            // Act
            const actions = [edge, unfolded, untold].map(
                candidate => describeSubject({ kind: "edge", edge: candidate, fromName: "a", toName: "b" }, context()).action
            )

            // Assert
            expect(actions).toEqual(["unfold", null, null])
        })
    })
})
