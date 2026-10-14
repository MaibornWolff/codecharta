import { DependencyDeclarations } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { GraphEdge, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { findCycleChains } from "../declarations/cycleChains"
import { indexDeclarations } from "../declarations/declarationIndex"
import { describeSubject, INSPECTOR_ROW_LIMIT, InspectorContext, InspectorModel } from "./inspectorModel"

const CREATURE = "/root/game/creature.ts"
const WEAPON = "/root/game/weapon.ts"
const UTIL = "/root/util/text.ts"

function declarationEdge(from: string, to: string, extra: Partial<DependencyLeafEdge> = {}): DependencyLeafEdge {
    const [fromNodeName, fromLeaf] = from.split("#")
    const [toNodeName, toLeaf] = to.split("#")
    return { fromNodeName, fromLeaf, toNodeName, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], ...extra }
}

const DECLARATION_EDGES = [
    declarationEdge(`${CREATURE}#Creature`, `${WEAPON}#Weapon`, { usage: ["inheritance", "usage"], isCyclic: true }),
    declarationEdge(`${WEAPON}#Weapon`, `${CREATURE}#Creature`, { isCyclic: true, isPointingUpwards: true }),
    declarationEdge(`${CREATURE}#Creature`, `${CREATURE}#Armor`),
    declarationEdge(`${CREATURE}#Armor`, `${UTIL}#format`, { usage: ["argument"] }),
    declarationEdge(`${CREATURE}#Creature`, "/root/gone.ts#Ghost")
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
    leafEdges: DECLARATION_EDGES
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

function context(overrides: Partial<InspectorContext> = {}, declarationEdges = DECLARATION_EDGES): InspectorContext {
    const index = indexDeclarations({ ...DECLARATIONS, leafEdges: declarationEdges })
    return {
        index,
        rowLimit: INSPECTOR_ROW_LIMIT,
        pointsUpward: declarationEdge => Boolean(declarationEdge.isPointingUpwards),
        cycles: findCycleChains(index),
        edgeMetric: "dependencies",
        ...overrides
    }
}

const ROOT_FOLDER: LeveledNode = { path: "/root", name: "root", level: 0, kind: "folder", children: [] }

function box(node: LeveledNode, { isOpen = false, parent = null as LeveledNode | null } = {}) {
    return { kind: "box", node, parent, isOpen } as const
}

function rowsOf(model: InspectorModel, title: string): string[] {
    const section = model.sections.find(candidate => candidate.title === title)
    const headingOf = (heading: InspectorModel["sections"][number]["groups"][number]["heading"]) =>
        typeof heading === "string" ? heading : (heading?.name ?? "-")
    return section.groups.flatMap(group =>
        group.dependencies.map(row => `${headingOf(group.heading)}: ${row.from.name} → ${row.to.name} (${row.specificUsages.join(", ")})`)
    )
}

function badgesOf(model: InspectorModel): string[] {
    return model.badges.map(badge => badge.text)
}

describe("describeSubject", () => {
    describe("a file", () => {
        it("should head the inspector with its folder, its name and what to copy, and tell its package, declarations and cycles as badges", () => {
            // Arrange
            const subject = box(CREATURE_NODE, { parent: GAME_FOLDER })

            // Act
            const model = describeSubject(subject, context())

            // Assert
            expect(model).toMatchObject({ kind: "file", title: "creature.ts", path: CREATURE, copyText: CREATURE })
            expect(model.parent).toEqual({ path: "/root/game", name: "game", kind: "folder", shownAs: "/root/game" })
            expect(model.badges).toEqual([
                { text: "file" },
                { text: "package game" },
                { text: "2 declarations" },
                { text: "1 cycle", isAboutCycles: true }
            ])
        })

        it("should list its declarations by name, each with its kind and the level it has", () => {
            // Arrange
            const subject = box(CREATURE_NODE)

            // Act
            const { declarations } = describeSubject(subject, context())

            // Assert
            expect(declarations).toEqual({
                count: 2,
                hiddenCount: 0,
                items: [
                    {
                        reference: { path: `${CREATURE}/Armor`, name: "Armor", kind: "declaration", declarationKind: "valueclass" },
                        detail: "value class"
                    },
                    {
                        reference: { path: `${CREATURE}/Creature`, name: "Creature", kind: "declaration", declarationKind: "class" },
                        detail: "class · level 1"
                    }
                ]
            })
        })

        it("should tell what it uses, the dependencies inside it first, and what uses it, each group under the other file", () => {
            // Arrange
            const subject = box(CREATURE_NODE)

            // Act
            const model = describeSubject(subject, context())

            // Assert
            expect(model.sections.map(section => [section.title, section.count])).toEqual([
                ["Uses", 3],
                ["Used by", 1]
            ])
            expect(rowsOf(model, "Uses")).toEqual([
                "this file: Creature → Armor ()",
                "text.ts: Armor → format (Takes as argument)",
                "weapon.ts: Creature → Weapon (Inherits from)"
            ])
            expect(rowsOf(model, "Used by")).toEqual(["weapon.ts: Weapon → Creature ()"])
        })

        it("should say which end of a dependency is the file's own, so the direction reads at a glance", () => {
            // Arrange
            const subject = box(CREATURE_NODE)

            // Act
            const model = describeSubject(subject, context())
            const [inside] = model.sections[0].groups[0].dependencies
            const [outgoing] = model.sections[0].groups[2].dependencies
            const [incoming] = model.sections[1].groups[0].dependencies

            // Assert
            expect([inside.isFromOwn, inside.isToOwn]).toEqual([true, true])
            expect([outgoing.isFromOwn, outgoing.isToOwn]).toEqual([true, false])
            expect([incoming.isFromOwn, incoming.isToOwn]).toEqual([false, true])
        })

        it("should carry each row's dependency for the graph to light up, the line of its strongest use and the edge type it is drawn in", () => {
            // Arrange
            const subject = box(CREATURE_NODE)

            // Act
            const model = describeSubject(subject, context())
            const [usedBy] = model.sections[1].groups[0].dependencies
            const [inherits] = model.sections[0].groups[2].dependencies

            // Assert
            expect(usedBy).toMatchObject({
                type: "feedbackLeafLevel",
                line: { dash: null, head: "filled" },
                declarationEdge: DECLARATION_EDGES[1]
            })
            expect(inherits).toMatchObject({ type: "cyclic", line: { dash: null, head: "hollow" } })
        })

        it("should take which way is up from the hierarchy shown, not from the dependency alone", () => {
            // Arrange
            const upwardByFileEdge = context({ pointsUpward: declarationEdge => declarationEdge === DECLARATION_EDGES[0] })

            // Act
            const model = describeSubject(box(CREATURE_NODE), upwardByFileEdge)

            // Assert
            expect(model.sections[0].groups[2].dependencies[0].type).toBe("feedbackLeafLevel")
            expect(model.sections[1].groups[0].dependencies[0].type).toBe("cyclic")
        })

        it("should offer to open a closed file and to close an open one, and neither for a file telling no declaration", () => {
            // Arrange
            const subjects = [box(CREATURE_NODE), box(CREATURE_NODE, { isOpen: true }), box(fileNode("/root/plain.ts"))]

            // Act
            const actions = subjects.map(subject => describeSubject(subject, context()).action)

            // Assert
            expect(actions).toEqual(["open", "close", null])
        })

        it("should tell its cycles as the declarations walked, each with the look of its dependency on the next", () => {
            // Arrange
            const subject = box(CREATURE_NODE)

            // Act
            const { cycles } = describeSubject(subject, context())

            // Assert
            expect(cycles.map(cycle => cycle.steps.map(step => step.reference.name))).toEqual([["Creature", "Weapon"]])
            expect(cycles[0].files.map(file => file.name)).toEqual(["creature.ts", "weapon.ts"])
            expect(cycles[0].declarationEdges).toEqual([DECLARATION_EDGES[0], DECLARATION_EDGES[1]])
            expect(cycles[0].steps.map(step => step.linkToNext)).toEqual([
                { line: expect.objectContaining({ dash: null, head: "hollow" }), type: "cyclic" },
                { line: expect.objectContaining({ dash: null, head: "filled" }), type: "feedbackLeafLevel" }
            ])
        })

        it("should tell a cycle from one of its own declarations, wherever the cycle was found from", () => {
            // Arrange
            const subject = box(fileNode(WEAPON, [declarationNode(WEAPON, "Weapon", "interface")]))

            // Act
            const { cycles } = describeSubject(subject, context())

            // Assert
            expect(cycles[0].steps.map(step => step.reference.name)).toEqual(["Weapon", "Creature"])
            expect(cycles[0].declarationEdges).toEqual([DECLARATION_EDGES[1], DECLARATION_EDGES[0]])
        })

        it("should count every cycle running through it and cut the ones told as it cuts a hub's rows", () => {
            // Arrange
            const uncut = context()
            const second = [DECLARATION_EDGES[2], { ...DECLARATION_EDGES[2], fromLeaf: "Armor", toLeaf: "Creature" }]
            const twoCycles = { ...uncut, cycles: [...uncut.cycles, second], rowLimit: 1 }

            // Act
            const model = describeSubject(box(CREATURE_NODE), twoCycles)

            // Assert
            expect(model.cycleCount).toBe(2)
            expect(model.cycles).toHaveLength(1)
        })

        it("should tell the upward dependencies between its own declarations alone, inside it, and none leaving it", () => {
            // Arrange
            const creatureUsesArmorUpward = context({
                pointsUpward: declarationEdge => declarationEdge === DECLARATION_EDGES[1] || declarationEdge === DECLARATION_EDGES[2]
            })

            // Act
            const { upward, upwardCount } = describeSubject(box(CREATURE_NODE), creatureUsesArmorUpward)

            // Assert
            expect(upwardCount).toBe(1)
            expect(upward.map(({ dependency }) => `${dependency.from.name} → ${dependency.to.name}`)).toEqual(["Creature → Armor"])
            expect(upward[0].dependency).toMatchObject({ type: "feedbackContainerLevel", declarationEdge: DECLARATION_EDGES[2] })
            expect(upward[0].files.map(file => file.name)).toEqual(["creature.ts"])
        })

        it("should tell of a row only its closer kinds of use, since that one declaration uses the other is what every row shows", () => {
            // Arrange
            const subject = box(CREATURE_NODE)

            // Act
            const model = describeSubject(subject, context())
            const usesOf = (row: { from: { name: string }; to: { name: string }; specificUsages: string[] }) =>
                `${row.from.name} → ${row.to.name}: ${row.specificUsages.join(", ") || "none"}`

            // Assert
            expect(model.sections[0].groups.flatMap(group => group.dependencies.map(usesOf))).toEqual([
                "Creature → Armor: none",
                "Armor → format: Takes as argument",
                "Creature → Weapon: Inherits from"
            ])
        })

        it("should order the files by name and, within a file, the dependencies pointing upward first, then those closing a cycle, then those in a cycle, then the rest by name", () => {
            // Arrange
            const toWeapon = (fromLeaf: string, extra: Partial<DependencyLeafEdge>) =>
                declarationEdge(`${CREATURE}#${fromLeaf}`, `${WEAPON}#Weapon`, extra)
            const declarationEdges = [
                toWeapon("Zebra", {}),
                toWeapon("Armor", {}),
                toWeapon("Cyclic", { isCyclic: true }),
                toWeapon("Closing", { isCyclic: true, isPointingUpwards: true }),
                toWeapon("Upward", { isPointingUpwards: true }),
                declarationEdge(`${CREATURE}#Armor`, `${UTIL}#format`)
            ]
            const kinds = { name: "", kind: "class" }
            const leavesOfCreature = Object.fromEntries(
                ["Zebra", "Armor", "Cyclic", "Closing", "Upward"].map(name => [name, { ...kinds, name }])
            )
            const index = indexDeclarations({
                leaves: { ...DECLARATIONS.leaves, [CREATURE]: leavesOfCreature },
                leafEdges: declarationEdges
            })
            const file = fileNode(
                CREATURE,
                Object.keys(leavesOfCreature).map(name => declarationNode(CREATURE, name, "class"))
            )

            // Act
            const model = describeSubject(box(file), context({ index, cycles: [] }))

            // Assert
            expect(rowsOf(model, "Uses").map(row => row.split(" (")[0])).toEqual([
                "text.ts: Armor → format",
                "weapon.ts: Upward → Weapon",
                "weapon.ts: Closing → Weapon",
                "weapon.ts: Cyclic → Weapon",
                "weapon.ts: Armor → Weapon",
                "weapon.ts: Zebra → Weapon"
            ])
        })

        it("should tell the cycle across the most files first, then the one through the most declarations, then by name", () => {
            // Arrange
            const chain = (...declarations: string[]) =>
                declarations.map((from, position) => declarationEdge(from, declarations[(position + 1) % declarations.length]))
            const [creature, armor, weapon, format] = [`${CREATURE}#Creature`, `${CREATURE}#Armor`, `${WEAPON}#Weapon`, `${UTIL}#format`]
            const cycles = [
                chain(creature, armor),
                chain(creature, weapon),
                chain(armor, weapon),
                chain(creature, armor, weapon),
                chain(creature, weapon, format)
            ]

            // Act
            const whole = describeSubject(box(CREATURE_NODE), context({ cycles }))
            const cut = describeSubject(box(CREATURE_NODE), context({ cycles, rowLimit: 2 }))

            // Assert
            const namesOf = (model: InspectorModel) => model.cycles.map(cycle => cycle.steps.map(step => step.reference.name).join(" → "))
            expect(namesOf(whole)).toEqual([
                "Creature → Weapon → format",
                "Creature → Armor → Weapon",
                "Armor → Weapon",
                "Creature → Weapon",
                "Creature → Armor"
            ])
            expect(namesOf(cut)).toEqual(["Creature → Weapon → format", "Creature → Armor → Weapon"])
            expect(cut.cycleCount).toBe(5)
        })

        it("should tell no cycle of a file none runs through", () => {
            // Arrange
            const fileOutsideEveryCycle = fileNode(UTIL, [declarationNode(UTIL, "format", "function")])

            // Act
            const model = describeSubject(box(fileOutsideEveryCycle), context())

            // Assert
            expect(model).toMatchObject({ cycleCount: 0, cycles: [] })
        })

        it("should cut a hub's declarations and the rows of each group, and say how many it left out", () => {
            // Arrange
            const twoToWeapon = [...DECLARATION_EDGES, declarationEdge(`${CREATURE}#Armor`, `${WEAPON}#Weapon`)]

            // Act
            const model = describeSubject(box(CREATURE_NODE), context({ rowLimit: 1 }, twoToWeapon))

            // Assert
            expect(model.declarations).toMatchObject({ count: 2, hiddenCount: 1 })
            expect(model.declarations.items).toHaveLength(1)
            expect(model.sections[0].groups.map(group => [group.dependencies.length, group.hiddenCount])).toEqual([
                [1, 0],
                [1, 0],
                [1, 1]
            ])
        })
    })

    describe("a declaration", () => {
        it("should head the inspector with its file and tell its kind, package, level and cycles as badges", () => {
            // Arrange
            const subject = box(CREATURE_NODE.children[0], { parent: CREATURE_NODE })

            // Act
            const model = describeSubject(subject, context())

            // Assert
            expect(model).toMatchObject({ kind: "declaration", title: "Creature", action: null, declarations: null, copyText: CREATURE })
            expect(model.parent).toEqual({ path: CREATURE, name: "creature.ts", kind: "file", shownAs: CREATURE })
            expect(badgesOf(model)).toEqual(["Class", "package game", "level 1", "1 cycle"])
        })

        it("should tell what it uses and what uses it, its own file among the others, and its cycles", () => {
            // Arrange
            const subject = box(CREATURE_NODE.children[0])

            // Act
            const model = describeSubject(subject, context())

            // Assert
            expect(rowsOf(model, "Uses")).toEqual(["creature.ts: Creature → Armor ()", "weapon.ts: Creature → Weapon (Inherits from)"])
            expect(rowsOf(model, "Used by")).toEqual(["weapon.ts: Weapon → Creature ()"])
            expect(model.cycles).toHaveLength(1)
        })

        it("should leave out the package and level a declaration does not have, and say little of one the map does not tell", () => {
            // Arrange
            const subject = box(declarationNode(WEAPON, "Weapon", "interface"))

            // Act
            const weapon = describeSubject(subject, context())
            const untold = describeSubject(box(declarationNode(WEAPON, "Ghost", "typealias")), context())

            // Assert
            expect(badgesOf(weapon)).toEqual(["Interface", "1 cycle"])
            expect(untold).toMatchObject({ parent: null, copyText: null, badges: [{ text: "typealias" }], cycles: [] })
        })
    })

    describe("a folder", () => {
        it("should count its files and declarations and the cyclic and upward dependencies touching them, leaving the files themselves to the explorer", () => {
            // Arrange
            const subject = box(GAME_FOLDER, { parent: ROOT_FOLDER })

            // Act
            const model = describeSubject(subject, context())

            // Assert
            expect(model).toMatchObject({
                kind: "folder",
                title: "game",
                sections: [],
                action: null,
                declarations: null,
                copyText: "/root/game"
            })
            expect(model.parent).toEqual({ path: "/root", name: "root", kind: "folder", shownAs: "/root" })
            expect(badgesOf(model)).toEqual(["folder", "2 files", "3 declarations", "2 cyclic", "1 upward", "1 cycle"])
            expect(model.cycles).toHaveLength(1)
        })

        it("should tell the upward dependencies between its files, from the one file to the other, and cut them as it cuts a hub's rows", () => {
            // Arrange
            const everyDependencyUpward = context({ pointsUpward: () => true, rowLimit: 2 })

            // Act
            const { upward, upwardCount } = describeSubject(box(GAME_FOLDER), everyDependencyUpward)

            // Assert
            expect(upwardCount).toBe(3)
            expect(upward).toHaveLength(2)
            expect(describeSubject(box(GAME_FOLDER), context()).upward.map(({ files }) => files.map(file => file.name))).toEqual([
                ["weapon.ts", "creature.ts"]
            ])
        })

        it("should head the root folder with nothing above it", () => {
            // Arrange
            const root = ROOT_FOLDER

            // Act
            const model = describeSubject(box(root), context())

            // Assert
            expect(model.parent).toBeNull()
        })

        it("should head a file with the package it is drawn in rather than the folder its path names", () => {
            // Arrange
            const gamePackage: LeveledNode = { ...GAME_FOLDER, path: "package:game", kind: "package" }

            // Act
            const model = describeSubject(box(CREATURE_NODE, { parent: gamePackage }), context())

            // Assert
            expect(model.parent).toEqual({ path: "package:game", name: "game", kind: "folder", shownAs: "package game" })
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
            declarationEdges: [DECLARATION_EDGES[0], DECLARATION_EDGES[2], DECLARATION_EDGES[3]]
        }

        it("should tell the dependencies it stands for and count them per kind of use, the most frequent first", () => {
            // Arrange
            const subject = { kind: "edge", edge, fromName: "creature.ts", toName: "weapon.ts" } as const

            // Act
            const model = describeSubject(subject, context())

            // Assert
            expect(model).toMatchObject({ kind: "edge", title: "creature.ts → weapon.ts", path: edge.id, parent: null, copyText: null })
            expect(badgesOf(model)).toEqual(["3 dependencies", "Uses 2", "Takes as argument 1", "Inherits from 1"])
            expect(rowsOf(model, "Stands for")).toEqual([
                "-: Creature → Weapon (Inherits from)",
                "-: Armor → format (Takes as argument)",
                "-: Creature → Armor ()"
            ])
            expect(model.sections[0].groups[0].dependencies.every(row => !row.isFromOwn && !row.isToOwn)).toBe(true)
        })

        it("should tell the weight under the edge metric shown, which counts dependencies only when it is theirs", () => {
            // Arrange
            const underAnotherMetric = context({ edgeMetric: "pairingRate" })
            const withoutDeclarations = { ...edge, weight: 37, declarationEdges: [] }

            // Act
            const model = describeSubject({ kind: "edge", edge: withoutDeclarations, fromName: "a", toName: "b" }, underAnotherMetric)

            // Assert
            expect(badgesOf(model)).toEqual(["pairingRate 37"])
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
