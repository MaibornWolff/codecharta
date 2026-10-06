import { fireEvent, render, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { PanelDependency, PanelModel, PanelRef } from "../../panel/panelModel"
import { DependencyPanelComponent } from "./dependencyPanel.component"

const CREATURE: PanelRef = { path: "/root/creature.ts/Creature", name: "Creature", kind: "declaration", declarationKind: "class" }
const WEAPON: PanelRef = { path: "/root/weapon.ts/Weapon", name: "Weapon", kind: "declaration", declarationKind: "interface" }
const WEAPON_FILE: PanelRef = { path: "/root/weapon.ts", name: "weapon.ts", kind: "file" }
const CREATURE_FILE: PanelRef = { path: "/root/creature.ts", name: "creature.ts", kind: "file" }
const ROOT_FOLDER = { path: "/root", name: "root", kind: "folder", shownAs: "/root" } as const

const EDGE_COLORS = { regular: "#8c96a3", cyclic: "#2563eb", feedbackContainerLevel: "#dc2626", feedbackLeafLevel: "#7f1d1d" }

const LEAF_EDGE: DependencyLeafEdge = {
    fromNodeName: "/root/creature.ts",
    fromLeaf: "Creature",
    toNodeName: "/root/weapon.ts",
    toLeaf: "Weapon",
    attributes: { dependencies: 1 },
    usage: ["inheritance"]
}

const DEPENDENCY: PanelDependency = {
    from: CREATURE,
    to: WEAPON,
    isFromOwn: true,
    isToOwn: false,
    usages: ["Inherits from"],
    line: { dash: [7, 4], head: "hollow" },
    type: "feedbackLeafLevel",
    leafEdge: LEAF_EDGE
}

const FILE_MODEL: PanelModel = {
    kind: "file",
    title: "creature.ts",
    parent: ROOT_FOLDER,
    path: "/root/creature.ts",
    copyText: "/root/creature.ts",
    badges: [{ text: "file" }, { text: "package game" }, { text: "6 cycles", isAboutCycles: true }],
    declarations: { count: 3, items: [{ ref: CREATURE, detail: "class · level 2" }], hiddenCount: 2 },
    sections: [
        { title: "Used by", count: 0, groups: [] },
        {
            title: "Uses",
            count: 5,
            groups: [
                {
                    heading: null,
                    label: "this file",
                    dependencies: [{ ...DEPENDENCY, to: CREATURE, isToOwn: true, type: "regular", usages: [] }],
                    hiddenCount: 0
                },
                { heading: WEAPON_FILE, label: "", dependencies: [DEPENDENCY], hiddenCount: 3 }
            ]
        }
    ],
    cycles: [
        {
            steps: [CREATURE, WEAPON, CREATURE],
            files: [CREATURE_FILE, WEAPON_FILE],
            links: [
                { line: { dash: [7, 4], head: "hollow" }, type: "cyclic" },
                { line: { dash: null, head: "filled" }, type: "feedbackLeafLevel" }
            ],
            leafEdges: [LEAF_EDGE, LEAF_EDGE]
        }
    ],
    cycleCount: 6,
    mayMissCycles: false,
    action: "open"
}

async function renderPanel(model: PanelModel = FILE_MODEL, cyclesRequest: number | null = null) {
    const handlers = {
        refChosen: jest.fn(),
        dependenciesPointedAt: jest.fn(),
        actionChosen: jest.fn(),
        cycleShown: jest.fn(),
        allRowsRequested: jest.fn(),
        closed: jest.fn()
    }
    const rendered = await render(DependencyPanelComponent, { inputs: { model, cyclesRequest, edgeColors: EDGE_COLORS }, on: handlers })
    return { ...rendered, ...handlers }
}

const fileCard = () => screen.getAllByTestId("dependency-panel-group")[1]
const fileRow = () => within(fileCard()).getByTestId("dependency-panel-row")

describe("DependencyPanelComponent", () => {
    it("should head the panel as the metrics inspector does: what lies above, the name and the badges, the one about cycles set off", async () => {
        // Arrange
        const { refChosen } = await renderPanel()

        // Act
        await userEvent.click(screen.getByTestId("dependency-panel-parent"))

        // Assert
        expect(screen.getByTestId("dependency-panel-parent").textContent.trim()).toBe("/root")
        expect(screen.getByTestId("dependency-panel-title").textContent.trim()).toBe("creature.ts")
        const badges = [...screen.getByTestId("dependency-panel-badges").children]
        expect(badges.map(badge => badge.textContent)).toEqual(["file", "package game", "6 cycles"])
        expect(badges.map(badge => badge.classList.contains("badge-info"))).toEqual([false, false, true])
        expect(refChosen).toHaveBeenCalledWith(ROOT_FOLDER)
    })

    it("should copy the path and say so for a moment", async () => {
        // Arrange
        jest.useFakeTimers()
        const writeText = jest.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })
        const { fixture } = await renderPanel()
        const copyButton = screen.getByTestId("dependency-panel-copy")

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
        const { fixture, rerender } = await renderPanel()
        const copyButton = screen.getByTestId("dependency-panel-copy")

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
        await rerender({ inputs: { model: { ...FILE_MODEL, path: "/root/other.ts" }, edgeColors: EDGE_COLORS } })
        fixture.detectChanges()

        // Assert
        expect([withoutClipboard, afterCopying]).toEqual(["Copy path", "Copied!"])
        expect(screen.getByTestId("dependency-panel-copy").getAttribute("title")).toBe("Copy path")
    })

    it("should say that there may be more cycles than shown only for a map too tangled to search", async () => {
        // Arrange
        const { fixture, rerender } = await renderPanel()
        const searchedToTheEnd = screen.queryByTestId("dependency-panel-cycles-incomplete")

        // Act
        await rerender({ inputs: { model: { ...FILE_MODEL, mayMissCycles: true }, edgeColors: EDGE_COLORS } })
        fixture.detectChanges()

        // Assert
        expect(searchedToTheEnd).toBeNull()
        expect(screen.getByTestId("dependency-panel-cycles-incomplete").textContent).toContain("there may be more")
    })

    it("should offer no copy button where there is nothing to copy, and no parent where nothing lies above", async () => {
        // Arrange
        const edgeLike: PanelModel = { ...FILE_MODEL, parent: null, copyText: null }

        // Act
        await renderPanel(edgeLike)

        // Assert
        expect(screen.queryByTestId("dependency-panel-copy")).toBeNull()
        expect(screen.queryByTestId("dependency-panel-parent")).toBeNull()
    })

    it("should put the cycles first, then what the selection uses, then its declarations, leaving out a section with nothing in it", async () => {
        // Act
        await renderPanel()

        // Assert
        const sections = [...screen.getByTestId("dependency-panel-body").querySelectorAll("section")].map(section =>
            section.getAttribute("aria-label")
        )
        expect(sections).toEqual(["Cycles", "Uses", "Declarations"])
        expect(screen.getByRole("region", { name: "Cycles" }).textContent).toContain("6")
        expect(screen.getByRole("region", { name: "Uses" }).textContent).toContain("5")
    })

    it("should draw a dependency as a chain: its two declarations with the edge between them, in the edge's dashes, head and colour", async () => {
        // Act
        await renderPanel()

        // Assert
        const row = fileRow()
        const connector = row.querySelector("svg")
        expect(row.textContent.replaceAll(/\s+/g, "")).toContain("CCreatureIWeapon")
        expect(connector.getAttribute("stroke")).toBe("#7f1d1d")
        expect(connector.getAttribute("aria-label")).toBe("Inherits from")
        expect(connector.querySelector("line").getAttribute("stroke-dasharray")).toBe("7 4")
        expect(connector.querySelector("polygon").getAttribute("fill")).toContain("#fff")
        expect(row.textContent).toContain("Inherits from")
        expect(screen.getByTestId("dependency-panel-row-type").textContent).toContain("Points upward and closes a cycle")
    })

    it("should outline the selection's own declarations in a row, and say nothing under a plain dependency", async () => {
        // Act
        await renderPanel()

        // Assert
        const [from, to] = [...fileRow().querySelectorAll("span.border")]
        expect([from.classList.contains("border-primary"), to.classList.contains("border-primary")]).toEqual([true, false])
        const [ownRow] = screen.getAllByTestId("dependency-panel-row")
        expect(ownRow.querySelectorAll("div")).toHaveLength(1)
        expect(ownRow.querySelector("svg").getAttribute("aria-label")).toBe("uses")
    })

    it("should put each other file's dependencies in a card under the file's name and count, the selection's own under a plain label", async () => {
        // Act
        await renderPanel()

        // Assert
        const [ownCard, otherCard] = screen.getAllByTestId("dependency-panel-group")
        expect(ownCard.textContent).toContain("this file")
        expect(within(otherCard).getByRole("button", { name: "weapon.ts" }).querySelector("i.fa-file-o")).not.toBeNull()
        expect(otherCard.textContent).toContain("4")
    })

    it("should go to the file or declaration a row names", async () => {
        // Arrange
        const { refChosen } = await renderPanel()

        // Act
        await userEvent.click(within(fileRow()).getByRole("button", { name: "Weapon" }))
        await userEvent.click(screen.getByRole("button", { name: "weapon.ts" }))

        // Assert
        expect(refChosen.mock.calls).toEqual([[WEAPON], [WEAPON_FILE]])
    })

    it("should point at a row's dependency while the pointer or the focus is on it", async () => {
        // Arrange
        const { dependenciesPointedAt } = await renderPanel()
        const row = fileRow()

        // Act
        fireEvent.mouseEnter(row)
        fireEvent.mouseLeave(row)
        fireEvent.focusIn(row)
        fireEvent.focusOut(row)

        // Assert
        expect(dependenciesPointedAt.mock.calls).toEqual([[[LEAF_EDGE]], [null], [[LEAF_EDGE]], [null]])
    })

    it("should draw a cycle as the same chain, each step in its edge's own line and colour, closed back to its start, and show it in the graph on request", async () => {
        // Arrange
        const { dependenciesPointedAt, cycleShown } = await renderPanel()
        const cycle = screen.getByTestId("dependency-panel-cycle")

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
        expect(screen.getByTestId("dependency-panel-cycle-closing").style.color).toBe("rgb(127, 29, 29)")
        expect(screen.getByTestId("dependency-panel-cycle-closing").textContent.trim()).toBe("↩ Creature")
        expect(screen.getByTestId("dependency-panel-cycle-where").textContent.replaceAll(/\s+/g, " ").trim()).toBe(
            "across creature.ts, weapon.ts"
        )
        expect(pointedAt).toEqual([[FILE_MODEL.cycles[0].leafEdges], [null], [FILE_MODEL.cycles[0].leafEdges], [null]])
        expect(cycleShown).toHaveBeenCalledWith(FILE_MODEL.cycles[0])
    })

    it("should list the declarations with their kind and level at the right", async () => {
        // Act
        await renderPanel()

        // Assert
        const declarations = screen.getByRole("region", { name: "Declarations" })
        expect(declarations.querySelector("li").textContent.replaceAll(/\s+/g, " ").trim()).toBe("CCreatureclass · level 2")
        expect(within(declarations).getByTitle("Class").textContent).toBe("C")
    })

    it("should offer the selection's action, everything a hub left out and to close the panel", async () => {
        // Arrange
        const { actionChosen, allRowsRequested, closed } = await renderPanel()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Open in graph" }))
        await userEvent.click(screen.getByRole("button", { name: "and 2 more" }))
        await userEvent.click(screen.getByRole("button", { name: "and 3 more" }))
        await userEvent.click(screen.getByTestId("dependency-panel-more-cycles"))
        await userEvent.click(screen.getByRole("button", { name: "Close inspector" }))

        // Assert
        expect(actionChosen).toHaveBeenCalledWith("open")
        expect(allRowsRequested).toHaveBeenCalledTimes(3)
        expect(closed).toHaveBeenCalledTimes(1)
    })

    it("should show only what a selection has: an edge's dependencies in a card without a name, no cycles, declarations or action", async () => {
        // Arrange
        const edgeModel: PanelModel = {
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
                    groups: [
                        { heading: null, label: "", dependencies: [{ ...DEPENDENCY, line: { dash: null, head: "dot" } }], hiddenCount: 0 }
                    ]
                }
            ],
            cycles: [],
            cycleCount: 0,
            mayMissCycles: false,
            action: null
        }

        // Act
        await renderPanel(edgeModel)

        // Assert
        expect(screen.queryByTestId("dependency-panel-cycles")).toBeNull()
        expect(screen.queryByRole("region", { name: "Declarations" })).toBeNull()
        expect(screen.queryByTestId("dependency-panel-action")).toBeNull()
        expect(screen.getByTestId("dependency-panel-group").querySelectorAll(":scope > div")).toHaveLength(1)
        expect(screen.getByTestId("dependency-panel-row").querySelector("circle")).not.toBeNull()
    })

    it("should draw the open arrowhead of a way of use that has one, and list no declarations for a file telling none", async () => {
        // Arrange
        const open: PanelModel = {
            ...FILE_MODEL,
            declarations: { count: 0, items: [], hiddenCount: 0 },
            sections: [
                {
                    title: "Uses",
                    count: 1,
                    groups: [
                        {
                            heading: WEAPON_FILE,
                            label: "",
                            dependencies: [{ ...DEPENDENCY, line: { dash: [2, 4], head: "open" } }],
                            hiddenCount: 0
                        }
                    ]
                }
            ]
        }

        // Act
        await renderPanel(open)

        // Assert
        expect(screen.getByTestId("dependency-panel-row").querySelector("polyline")).not.toBeNull()
        expect(screen.queryByRole("region", { name: "Declarations" })).toBeNull()
    })

    it("should bring the cycles into view when asked to, once per request", async () => {
        // Arrange
        const scrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        const { rerender, fixture } = await renderPanel(FILE_MODEL, null)

        // Act
        await rerender({ inputs: { model: FILE_MODEL, cyclesRequest: 1, edgeColors: EDGE_COLORS } })
        fixture.detectChanges()
        await rerender({ inputs: { model: { ...FILE_MODEL, path: "/root/other.ts" }, cyclesRequest: 1, edgeColors: EDGE_COLORS } })
        fixture.detectChanges()

        // Assert
        expect(scrollIntoView).toHaveBeenCalledTimes(1)
    })
})
