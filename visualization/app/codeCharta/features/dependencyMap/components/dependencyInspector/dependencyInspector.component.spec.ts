import { signal } from "@angular/core"
import { fireEvent, render, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { defaultDependencyGraphSettings } from "../../../../stores/preferences/preferences.read.facade"
import { InspectorDependency, InspectorModel, InspectorReference } from "../../inspector/inspectorModel"
import { DependencyInspectorStore } from "../../stores/dependencyInspector.store"
import { DependencyInspectorComponent } from "./dependencyInspector.component"

const CREATURE: InspectorReference = { path: "/root/creature.ts/Creature", name: "Creature", kind: "declaration", declarationKind: "class" }
const WEAPON: InspectorReference = { path: "/root/weapon.ts/Weapon", name: "Weapon", kind: "declaration", declarationKind: "interface" }
const WEAPON_FILE: InspectorReference = { path: "/root/weapon.ts", name: "weapon.ts", kind: "file" }
const CREATURE_FILE: InspectorReference = { path: "/root/creature.ts", name: "creature.ts", kind: "file" }
const ROOT_FOLDER = { path: "/root", name: "root", kind: "folder", shownAs: "/root" } as const

const EDGE_COLORS = defaultDependencyGraphSettings.edgeColors

const DECLARATION_EDGE: DependencyLeafEdge = {
    fromNodeName: "/root/creature.ts",
    fromLeaf: "Creature",
    toNodeName: "/root/weapon.ts",
    toLeaf: "Weapon",
    attributes: { dependencies: 1 },
    usage: ["inheritance"]
}

const DEPENDENCY: InspectorDependency = {
    from: CREATURE,
    to: WEAPON,
    isFromOwn: true,
    isToOwn: false,
    usages: ["Inherits from"],
    line: { dash: [7, 4], head: "hollow" },
    type: "feedbackLeafLevel",
    declarationEdge: DECLARATION_EDGE
}

const FILE_MODEL: InspectorModel = {
    kind: "file",
    title: "creature.ts",
    parent: ROOT_FOLDER,
    path: "/root/creature.ts",
    copyText: "/root/creature.ts",
    badges: [{ text: "file" }, { text: "package game" }, { text: "6 cycles", isAboutCycles: true }],
    declarations: { count: 3, items: [{ reference: CREATURE, detail: "class · level 2" }], hiddenCount: 2 },
    sections: [
        { title: "Used by", count: 0, groups: [] },
        {
            title: "Uses",
            count: 5,
            groups: [
                {
                    heading: "this file",
                    dependencies: [{ ...DEPENDENCY, to: CREATURE, isToOwn: true, type: "regular", usages: [] }],
                    hiddenCount: 0
                },
                { heading: WEAPON_FILE, dependencies: [DEPENDENCY], hiddenCount: 3 }
            ]
        }
    ],
    cycles: [
        {
            steps: [
                { reference: CREATURE, linkToNext: { line: { dash: [7, 4], head: "hollow" }, type: "cyclic" } },
                { reference: WEAPON, linkToNext: { line: { dash: null, head: "filled" }, type: "feedbackLeafLevel" } }
            ],
            files: [CREATURE_FILE, WEAPON_FILE],
            declarationEdges: [DECLARATION_EDGE, DECLARATION_EDGE]
        }
    ],
    cycleCount: 6,
    mayMissCycles: false,
    action: "open"
}

interface Shown {
    model: InspectorModel
    cyclesRequest?: number | null
}

async function renderInspector(model: InspectorModel = FILE_MODEL, cyclesRequest: number | null = null) {
    const handlers = {
        referenceChosen: jest.fn(),
        dependenciesPointedAt: jest.fn(),
        actionChosen: jest.fn(),
        cycleShown: jest.fn(),
        allRowsRequested: jest.fn(),
        closed: jest.fn(),
        cyclesRequestAnswered: jest.fn()
    }
    const shown = { model: signal<InspectorModel | null>(model), cyclesRequest: signal(cyclesRequest) }
    const store: Partial<DependencyInspectorStore> = {
        ...shown,
        edgeColors: signal(EDGE_COLORS),
        goTo: handlers.referenceChosen,
        pointAt: handlers.dependenciesPointedAt,
        perform: handlers.actionChosen,
        showCycle: handlers.cycleShown,
        showAllRows: handlers.allRowsRequested,
        dismiss: handlers.closed,
        answerCyclesRequest: handlers.cyclesRequestAnswered.mockImplementation(() => shown.cyclesRequest.set(null))
    }
    const rendered = await render(DependencyInspectorComponent, { providers: [{ provide: DependencyInspectorStore, useValue: store }] })
    const rerender = async ({ inputs }: { inputs: Shown }) => {
        shown.model.set(inputs.model)
        if (inputs.cyclesRequest !== undefined) {
            shown.cyclesRequest.set(inputs.cyclesRequest)
        }
        rendered.fixture.detectChanges()
    }
    return { ...rendered, ...handlers, rerender, shown }
}

const fileCard = () => screen.getAllByTestId("dependency-inspector-group")[1]
const fileRow = () => within(fileCard()).getByTestId("dependency-inspector-row")

describe("DependencyInspectorComponent", () => {
    it("should head the inspector as the metrics inspector does: what lies above, the name and the badges, the one about cycles set off", async () => {
        // Arrange
        const { referenceChosen } = await renderInspector()

        // Act
        await userEvent.click(screen.getByTestId("dependency-inspector-parent"))

        // Assert
        expect(screen.getByTestId("dependency-inspector-parent").textContent.trim()).toBe("/root")
        expect(screen.getByTestId("dependency-inspector-title").textContent.trim()).toBe("creature.ts")
        const badges = [...screen.getByTestId("dependency-inspector-badges").children]
        expect(badges.map(badge => badge.textContent)).toEqual(["file", "package game", "6 cycles"])
        expect(badges.map(badge => badge.classList.contains("badge-info"))).toEqual([false, false, true])
        expect(referenceChosen).toHaveBeenCalledWith(ROOT_FOLDER)
    })

    it("should copy the path and say so for a moment", async () => {
        // Arrange
        jest.useFakeTimers()
        const writeText = jest.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })
        const { fixture } = await renderInspector()
        const copyButton = screen.getByTestId("dependency-inspector-copy")

        // Act
        copyButton.click()
        await Promise.resolve()
        fixture.detectChanges()
        const whileCopied = copyButton.getAttribute("title")
        jest.advanceTimersByTime(1500)
        fixture.detectChanges()
        jest.useRealTimers()

        // Assert
        expect(writeText).toHaveBeenCalledWith("/root/creature.ts")
        expect(whileCopied).toBe("Copied!")
        expect(copyButton.getAttribute("title")).toBe("Copy path")
    })

    it("should say nothing was copied where the page has no clipboard, and forget a copy once another subject is shown", async () => {
        // Arrange
        Object.assign(navigator, { clipboard: undefined })
        const { fixture, rerender } = await renderInspector()
        const copyButton = screen.getByTestId("dependency-inspector-copy")

        // Act
        copyButton.click()
        await fixture.whenStable()
        fixture.detectChanges()
        const withoutClipboard = copyButton.getAttribute("title")
        Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } })
        copyButton.click()
        await fixture.whenStable()
        fixture.detectChanges()
        const afterCopying = copyButton.getAttribute("title")
        await rerender({ inputs: { model: { ...FILE_MODEL, path: "/root/other.ts" } } })
        fixture.detectChanges()

        // Assert
        expect([withoutClipboard, afterCopying]).toEqual(["Copy path", "Copied!"])
        expect(screen.getByTestId("dependency-inspector-copy").getAttribute("title")).toBe("Copy path")
    })

    it("should say that there may be more cycles than shown only for a map too tangled to search", async () => {
        // Arrange
        const { fixture, rerender } = await renderInspector()
        const searchedToTheEnd = screen.queryByTestId("dependency-inspector-cycles-incomplete")

        // Act
        await rerender({ inputs: { model: { ...FILE_MODEL, mayMissCycles: true } } })
        fixture.detectChanges()

        // Assert
        expect(searchedToTheEnd).toBeNull()
        expect(screen.getByTestId("dependency-inspector-cycles-incomplete").textContent).toContain("there may be more")
    })

    it("should offer no copy button where there is nothing to copy, and no parent where nothing lies above", async () => {
        // Arrange
        const edgeLike: InspectorModel = { ...FILE_MODEL, parent: null, copyText: null }

        // Act
        await renderInspector(edgeLike)

        // Assert
        expect(screen.queryByTestId("dependency-inspector-copy")).toBeNull()
        expect(screen.queryByTestId("dependency-inspector-parent")).toBeNull()
    })

    it("should put the cycles first, then what the selection uses, then its declarations, leaving out a section with nothing in it", async () => {
        // Arrange
        await renderInspector()

        // Act
        const sections = [...screen.getByTestId("dependency-inspector-body").querySelectorAll("section")].map(section =>
            section.getAttribute("aria-label")
        )

        // Assert
        expect(sections).toEqual(["Cycles", "Uses", "Declarations"])
        expect(screen.getByRole("region", { name: "Cycles" }).textContent).toContain("6")
        expect(screen.getByRole("region", { name: "Uses" }).textContent).toContain("5")
    })

    it("should draw a dependency as a chain: its two declarations with the edge between them, in the edge's dashes, head and colour", async () => {
        // Arrange
        await renderInspector()

        // Act
        const row = fileRow()
        const connector = row.querySelector("svg")

        // Assert
        expect(row.textContent.replaceAll(/\s+/g, "")).toContain("CCreatureIWeapon")
        expect(connector.getAttribute("stroke")).toBe("#7f1d1d")
        expect(connector.getAttribute("aria-label")).toBe("Inherits from")
        expect(connector.querySelector("line").getAttribute("stroke-dasharray")).toBe("7 4")
        expect(connector.querySelector("polygon").getAttribute("fill")).toContain("#fff")
        expect(row.textContent).toContain("Inherits from")
        expect(screen.getByTestId("dependency-inspector-row-type").textContent).toContain("Points upward and closes a cycle")
    })

    it("should outline the selection's own declarations in a row, and say nothing under a plain dependency", async () => {
        // Arrange
        await renderInspector()

        // Act
        const [from, to] = [...fileRow().querySelectorAll("span.border")]

        // Assert
        expect([from.classList.contains("border-primary"), to.classList.contains("border-primary")]).toEqual([true, false])
        const [ownRow] = screen.getAllByTestId("dependency-inspector-row")
        expect(ownRow.querySelectorAll("div")).toHaveLength(1)
        expect(ownRow.querySelector("svg").getAttribute("aria-label")).toBe("uses")
    })

    it("should put each other file's dependencies in a card under the file's name and count, the selection's own under a plain label", async () => {
        // Arrange
        await renderInspector()

        // Act
        const [ownCard, otherCard] = screen.getAllByTestId("dependency-inspector-group")

        // Assert
        expect(ownCard.textContent).toContain("this file")
        expect(within(otherCard).getByRole("button", { name: "weapon.ts" }).querySelector("i.fa-file-o")).not.toBeNull()
        expect(otherCard.textContent).toContain("4")
    })

    it("should go to the file or declaration a row names", async () => {
        // Arrange
        const { referenceChosen } = await renderInspector()

        // Act
        await userEvent.click(within(fileRow()).getByRole("button", { name: "Weapon" }))
        await userEvent.click(screen.getByRole("button", { name: "weapon.ts" }))

        // Assert
        expect(referenceChosen.mock.calls).toEqual([[WEAPON], [WEAPON_FILE]])
    })

    it("should point at a row's dependency while the pointer or the focus is on it", async () => {
        // Arrange
        const { dependenciesPointedAt } = await renderInspector()
        const row = fileRow()

        // Act
        fireEvent.mouseEnter(row)
        fireEvent.mouseLeave(row)
        fireEvent.focusIn(row)
        fireEvent.focusOut(row)

        // Assert
        expect(dependenciesPointedAt.mock.calls).toEqual([[[DECLARATION_EDGE]], [null], [[DECLARATION_EDGE]], [null]])
    })

    it("should draw a cycle as the same chain, each step in its edge's own line and colour, closed back to its start, and show it in the graph on request", async () => {
        // Arrange
        const { dependenciesPointedAt, cycleShown } = await renderInspector()
        const cycle = screen.getByTestId("dependency-inspector-cycle")

        // Act
        fireEvent.mouseEnter(cycle)
        fireEvent.mouseLeave(cycle)
        fireEvent.focusIn(cycle)
        fireEvent.focusOut(cycle)
        const pointedAt = [...dependenciesPointedAt.mock.calls]
        await userEvent.click(within(cycle).getByRole("button", { name: "Show in graph" }))

        // Assert
        expect(cycle.querySelectorAll("svg")).toHaveLength(1)
        expect(cycle.querySelector("svg").getAttribute("stroke")).toBe("#2563eb")
        expect(cycle.querySelector("svg line").getAttribute("stroke-dasharray")).toBe("7 4")
        expect(screen.getByTestId("dependency-inspector-cycle-closing").style.color).toBe("rgb(127, 29, 29)")
        expect(screen.getByTestId("dependency-inspector-cycle-closing").textContent.trim()).toBe("↩ Creature")
        expect(screen.getByTestId("dependency-inspector-cycle-where").textContent.replaceAll(/\s+/g, " ").trim()).toBe(
            "across creature.ts, weapon.ts"
        )
        expect(pointedAt).toEqual([[FILE_MODEL.cycles[0].declarationEdges], [null], [FILE_MODEL.cycles[0].declarationEdges], [null]])
        expect(cycleShown).toHaveBeenCalledWith(FILE_MODEL.cycles[0])
    })

    it("should list the declarations with their kind and level at the right", async () => {
        // Arrange
        await renderInspector()

        // Act
        const declarations = screen.getByRole("region", { name: "Declarations" })

        // Assert
        expect(declarations.querySelector("li").textContent.replaceAll(/\s+/g, " ").trim()).toBe("CCreatureclass · level 2")
        expect(within(declarations).getByTitle("Class").textContent).toBe("C")
    })

    it("should offer the selection's action, everything a hub left out and to close the inspector", async () => {
        // Arrange
        const { actionChosen, allRowsRequested, closed } = await renderInspector()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Open in graph" }))
        await userEvent.click(screen.getByRole("button", { name: "and 2 more" }))
        await userEvent.click(screen.getByRole("button", { name: "and 3 more" }))
        await userEvent.click(screen.getByTestId("dependency-inspector-more-cycles"))
        await userEvent.click(screen.getByRole("button", { name: "Close inspector" }))

        // Assert
        expect(actionChosen).toHaveBeenCalledWith("open")
        expect(allRowsRequested).toHaveBeenCalledTimes(3)
        expect(closed).toHaveBeenCalledTimes(1)
    })

    it("should show only what a selection has: an edge's dependencies in a card without a name, no cycles, declarations or action", async () => {
        // Arrange
        const edgeModel: InspectorModel = {
            kind: "edge",
            title: "creature.ts → weapon.ts",
            parent: null,
            path: "/root/creature.ts|/root/weapon.ts",
            copyText: null,
            badges: [{ text: "1 dependency" }],
            declarations: null,
            sections: [
                {
                    title: "Stands for",
                    count: 1,
                    groups: [{ heading: null, dependencies: [{ ...DEPENDENCY, line: { dash: null, head: "dot" } }], hiddenCount: 0 }]
                }
            ],
            cycles: [],
            cycleCount: 0,
            mayMissCycles: false,
            action: null
        }

        // Act
        await renderInspector(edgeModel)

        // Assert
        expect(screen.queryByTestId("dependency-inspector-cycles")).toBeNull()
        expect(screen.queryByRole("region", { name: "Declarations" })).toBeNull()
        expect(screen.queryByTestId("dependency-inspector-action")).toBeNull()
        expect(screen.getByTestId("dependency-inspector-group").querySelectorAll(":scope > div")).toHaveLength(1)
        expect(screen.getByTestId("dependency-inspector-row").querySelector("circle")).not.toBeNull()
    })

    it("should draw the open arrowhead of a way of use that has one, and list no declarations for a file telling none", async () => {
        // Arrange
        const open: InspectorModel = {
            ...FILE_MODEL,
            declarations: { count: 0, items: [], hiddenCount: 0 },
            sections: [
                {
                    title: "Uses",
                    count: 1,
                    groups: [
                        {
                            heading: WEAPON_FILE,
                            dependencies: [{ ...DEPENDENCY, line: { dash: [2, 4], head: "open" } }],
                            hiddenCount: 0
                        }
                    ]
                }
            ]
        }

        // Act
        await renderInspector(open)

        // Assert
        expect(screen.getByTestId("dependency-inspector-row").querySelector("polyline")).not.toBeNull()
        expect(screen.queryByRole("region", { name: "Declarations" })).toBeNull()
    })

    it("should bring the cycles into view when asked to and answer the request, so it is not replayed", async () => {
        // Arrange
        const scrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        const { rerender, fixture, cyclesRequestAnswered } = await renderInspector(FILE_MODEL, null)

        // Act
        await rerender({ inputs: { model: FILE_MODEL, cyclesRequest: 1 } })
        fixture.detectChanges()
        await rerender({ inputs: { model: { ...FILE_MODEL, path: "/root/other.ts" } } })
        fixture.detectChanges()

        // Assert
        expect(scrollIntoView).toHaveBeenCalledTimes(1)
        expect(cyclesRequestAnswered).toHaveBeenCalledTimes(1)
    })
})
