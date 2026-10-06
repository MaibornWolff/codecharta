import { DependencyDeclarations } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { GraphEdge, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { findCycleChains } from "./cycleChains"
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

function context(
    rowLimit = 20,
    pointsUpward: PanelContext["pointsUpward"] = leafEdge => Boolean(leafEdge.isPointingUpwards)
): PanelContext {
    const index = indexDeclarations(DECLARATIONS)
    return { index, rowLimit, pointsUpward, cycles: findCycleChains(index) }
}

function box(node: LeveledNode, isOpen = false) {
    return { kind: "box", node, isOpen } as const
}

function rowsOf(model: PanelModel, title: string): string[] {
    const section = model.sections.find(candidate => candidate.title === title)
    return section.groups.flatMap(group =>
        group.dependencies.map(
            row => `${group.heading?.name ?? (group.label || "-")}: ${row.from.name} → ${row.to.name} (${row.usages.join(", ")})`
        )
    )
}

function badgesOf(model: PanelModel): string[] {
    return model.badges.map(badge => badge.text)
}

describe("describeSubject", () => {
    describe("a file", () => {
        it("should head the panel with its folder, its name and what to copy, and tell its package, declarations and cycles as badges", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context())

            // Assert
            expect(model).toMatchObject({ kind: "file", title: "creature.ts", path: CREATURE, copyText: CREATURE })
            expect(model.parent).toEqual({ path: "/root/game", name: "game", kind: "folder" })
            expect(model.badges).toEqual([
                { text: "file" },
                { text: "package game" },
                { text: "2 declarations" },
                { text: "1 cycle", isAboutCycles: true }
            ])
        })

        it("should list its declarations by name, each with its kind and the level it has", () => {
            // Act
            const { declarations } = describeSubject(box(CREATURE_NODE), context())

            // Assert
            expect(declarations).toEqual({
                count: 2,
                hiddenCount: 0,
                items: [
                    {
                        ref: { path: `${CREATURE}/Armor`, name: "Armor", kind: "declaration", declarationKind: "valueclass" },
                        detail: "value class"
                    },
                    {
                        ref: { path: `${CREATURE}/Creature`, name: "Creature", kind: "declaration", declarationKind: "class" },
                        detail: "class · level 1"
                    }
                ]
            })
        })

        it("should tell what it uses, the dependencies inside it first, and what uses it, each group under the other file", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context())

            // Assert
            expect(model.sections.map(section => [section.title, section.count])).toEqual([
                ["Uses", 3],
                ["Used by", 1]
            ])
            expect(rowsOf(model, "Uses")).toEqual([
                "this file: Creature → Armor (Uses)",
                "weapon.ts: Creature → Weapon (Inherits from, Uses)",
                "text.ts: Armor → format (Takes as argument)"
            ])
            expect(rowsOf(model, "Used by")).toEqual(["weapon.ts: Weapon → Creature (Uses)"])
        })

        it("should say which end of a dependency is the file's own, so the direction reads at a glance", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context())
            const [inside] = model.sections[0].groups[0].dependencies
            const [outgoing] = model.sections[0].groups[1].dependencies
            const [incoming] = model.sections[1].groups[0].dependencies

            // Assert
            expect([inside.isFromOwn, inside.isToOwn]).toEqual([true, true])
            expect([outgoing.isFromOwn, outgoing.isToOwn]).toEqual([true, false])
            expect([incoming.isFromOwn, incoming.isToOwn]).toEqual([false, true])
        })

        it("should carry each row's dependency for the graph to light up, the line of its strongest use and the edge type it is drawn in", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context())
            const [usedBy] = model.sections[1].groups[0].dependencies
            const [inherits] = model.sections[0].groups[1].dependencies

            // Assert
            expect(usedBy).toMatchObject({ type: "feedbackLeafLevel", line: { dash: null, head: "filled" }, leafEdge: LEAF_EDGES[1] })
            expect(inherits).toMatchObject({ type: "cyclic", line: { dash: null, head: "hollow" } })
        })

        it("should take which way is up from the hierarchy shown, not from the dependency alone", () => {
            // Arrange
            const upwardByFileEdge = context(20, leafEdge => leafEdge === LEAF_EDGES[0])

            // Act
            const model = describeSubject(box(CREATURE_NODE), upwardByFileEdge)

            // Assert
            expect(model.sections[0].groups[1].dependencies[0].type).toBe("feedbackLeafLevel")
            expect(model.sections[1].groups[0].dependencies[0].type).toBe("cyclic")
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
            expect(cycles[0].files.map(file => file.name)).toEqual(["creature.ts", "weapon.ts"])
            expect(cycles[0].leafEdges).toEqual([LEAF_EDGES[0], LEAF_EDGES[1]])
            expect(cycles[0].links).toEqual([
                { line: expect.objectContaining({ dash: null, head: "hollow" }), type: "cyclic" },
                { line: expect.objectContaining({ dash: null, head: "filled" }), type: "feedbackLeafLevel" }
            ])
        })

        it("should tell a cycle from one of its own declarations, wherever the cycle was found from", () => {
            // Act
            const { cycles } = describeSubject(box(fileNode(WEAPON, [declarationNode(WEAPON, "Weapon", "interface")])), context())

            // Assert
            expect(cycles[0].steps.map(step => step.name)).toEqual(["Weapon", "Creature", "Weapon"])
            expect(cycles[0].leafEdges).toEqual([LEAF_EDGES[1], LEAF_EDGES[0]])
        })

        it("should count every cycle running through it and cut the ones told as it cuts a hub's rows", () => {
            // Arrange
            const uncut = context()
            const second = [LEAF_EDGES[2], { ...LEAF_EDGES[2], fromLeaf: "Armor", toLeaf: "Creature" }]
            const twoCycles = { ...uncut, cycles: [...uncut.cycles, second], rowLimit: 1 }

            // Act
            const model = describeSubject(box(CREATURE_NODE), twoCycles)

            // Assert
            expect(model.cycleCount).toBe(2)
            expect(model.cycles).toHaveLength(1)
            expect(describeSubject(box(fileNode(UTIL, [declarationNode(UTIL, "format", "function")])), uncut)).toMatchObject({
                cycleCount: 0,
                cycles: []
            })
        })

        it("should cut a hub's rows and say how many it left out", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE), context(1))

            // Assert
            expect(model.declarations).toMatchObject({ count: 2, hiddenCount: 1 })
            expect(model.declarations.items).toHaveLength(1)
            expect(model.sections[0].groups.map(group => group.hiddenCount)).toEqual([0, 0, 0])
        })
    })

    describe("a declaration", () => {
        it("should head the panel with its file and tell its kind, package, level and cycles as badges", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE.children[0]), context())

            // Assert
            expect(model).toMatchObject({ kind: "declaration", title: "Creature", action: null, declarations: null, copyText: CREATURE })
            expect(model.parent).toEqual({ path: CREATURE, name: "creature.ts", kind: "file" })
            expect(badgesOf(model)).toEqual(["Class", "package game", "level 1", "1 cycle"])
        })

        it("should tell what it uses and what uses it, its own file among the others, and its cycles", () => {
            // Act
            const model = describeSubject(box(CREATURE_NODE.children[0]), context())

            // Assert
            expect(rowsOf(model, "Uses")).toEqual([
                "creature.ts: Creature → Armor (Uses)",
                "weapon.ts: Creature → Weapon (Inherits from, Uses)"
            ])
            expect(rowsOf(model, "Used by")).toEqual(["weapon.ts: Weapon → Creature (Uses)"])
            expect(model.cycles).toHaveLength(1)
        })

        it("should leave out the package and level a declaration does not have, and say little of one the map does not tell", () => {
            // Act
            const weapon = describeSubject(box(declarationNode(WEAPON, "Weapon", "interface")), context())
            const untold = describeSubject(box(declarationNode(WEAPON, "Ghost", "typealias")), context())

            // Assert
            expect(badgesOf(weapon)).toEqual(["Interface", "1 cycle"])
            expect(untold).toMatchObject({ parent: null, copyText: null, badges: [{ text: "typealias" }], cycles: [] })
        })
    })

    describe("a folder", () => {
        it("should count its files and declarations and the cyclic and upward dependencies touching them, leaving the files themselves to the explorer", () => {
            // Act
            const model = describeSubject(box(GAME_FOLDER), context())

            // Assert
            expect(model).toMatchObject({
                kind: "folder",
                title: "game",
                sections: [],
                action: null,
                declarations: null,
                copyText: "/root/game"
            })
            expect(model.parent).toEqual({ path: "/root", name: "root", kind: "folder" })
            expect(badgesOf(model)).toEqual(["folder", "2 files", "3 declarations", "2 cyclic", "1 upward", "1 cycle"])
            expect(model.cycles).toHaveLength(1)
        })

        it("should head the root folder with nothing above it", () => {
            // Arrange
            const root: LeveledNode = { ...GAME_FOLDER, path: "/root", name: "root" }

            // Act
            const model = describeSubject(box(root), context())

            // Assert
            expect(model.parent).toBeNull()
        })
    })

    describe("a package", () => {
        it("should be told as a folder is, by what it holds, and copy its name", () => {
            // Arrange
            const gamePackage: LeveledNode = { ...GAME_FOLDER, path: "package:game", kind: "package" }

            // Act
            const model = describeSubject(box(gamePackage), context())

            // Assert
            expect(model).toMatchObject({ title: "game", path: "package:game", parent: null, copyText: "game" })
            expect(badgesOf(model).slice(0, 2)).toEqual(["package", "2 files"])
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
            expect(model).toMatchObject({ kind: "edge", title: "creature.ts → weapon.ts", path: edge.id, parent: null, copyText: null })
            expect(badgesOf(model)).toEqual(["3 dependencies", "Takes as argument 1", "Inherits from 1", "Uses 1"])
            expect(rowsOf(model, "Stands for")).toEqual([
                "-: Armor → format (Takes as argument)",
                "-: Creature → Weapon (Inherits from, Uses)"
            ])
            expect(model.sections[0].groups[0].dependencies.map(row => [row.isFromOwn, row.isToOwn])).toEqual([
                [false, false],
                [false, false]
            ])
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
