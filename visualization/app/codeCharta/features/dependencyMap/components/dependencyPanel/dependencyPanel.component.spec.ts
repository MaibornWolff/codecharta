import { fireEvent, render, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { PanelDependency, PanelModel, PanelRef } from "../../panel/panelModel"
import { DependencyPanelComponent } from "./dependencyPanel.component"

const CREATURE: PanelRef = { path: "/root/creature.ts/Creature", name: "Creature", kind: "declaration", declarationKind: "class" }
const WEAPON: PanelRef = { path: "/root/weapon.ts/Weapon", name: "Weapon", kind: "declaration", declarationKind: "interface" }
const WEAPON_FILE: PanelRef = { path: "/root/weapon.ts", name: "weapon.ts", kind: "file" }
const CREATURE_FILE: PanelRef = { path: "/root/creature.ts", name: "creature.ts", kind: "file" }
const GAME_FOLDER: PanelRef = { path: "/root", name: "root", kind: "folder" }

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
    usages: ["Inherits from"],
    line: { dash: [7, 4], head: "hollow" },
    type: "feedbackLeafLevel",
    leafEdge: LEAF_EDGE
}

const FILE_MODEL: PanelModel = {
    kind: "file",
    title: "creature.ts",
    subtitle: "File",
    path: "/root/creature.ts",
    facts: [
        { label: "Folder", value: "/root", ref: GAME_FOLDER },
        { label: "Package", value: "game" }
    ],
    lists: [{ title: "Declarations", count: 3, refs: [CREATURE], hiddenCount: 2 }],
    sections: [
        { title: "Inside the file", count: 0, groups: [] },
        { title: "Uses", count: 4, groups: [{ heading: WEAPON_FILE, dependencies: [DEPENDENCY], hiddenCount: 3 }] }
    ],
    cycles: [{ steps: [CREATURE, WEAPON, CREATURE], files: [CREATURE_FILE, WEAPON_FILE], leafEdges: [LEAF_EDGE, LEAF_EDGE] }],
    action: "open"
}

async function renderPanel(model: PanelModel = FILE_MODEL, cyclesRequest = 0) {
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

describe("DependencyPanelComponent", () => {
    it("should name the selection and tell its facts, a fact that leads somewhere as a link", async () => {
        // Act
        await renderPanel()

        // Assert
        expect(screen.getByTestId("dependency-panel-subtitle").textContent).toBe("File")
        expect(screen.getByTestId("dependency-panel-title").textContent).toBe("creature.ts")
        const facts = screen.getByTestId("dependency-panel-facts")
        expect(facts.textContent).toContain("Package")
        expect(within(facts).getByRole("button", { name: "root" })).not.toBeNull()
    })

    it("should list what the selection holds and how it depends on others, leaving out a section with nothing in it", async () => {
        // Act
        await renderPanel()

        // Assert
        expect(screen.getByRole("region", { name: "Declarations" }).textContent).toContain("Declarations · 3")
        expect(screen.getByRole("region", { name: "Uses" }).textContent).toContain("Uses · 4")
        expect(screen.queryByRole("region", { name: "Inside the file" })).toBeNull()
        const row = screen.getByTestId("dependency-panel-row")
        expect(row.textContent).toContain("Creature")
        expect(row.textContent).toContain("Weapon")
        expect(row.textContent).toContain("Inherits from")
        expect(screen.getByTestId("dependency-panel-row-type").textContent).toContain("Points upward and closes a cycle")
        expect(row.querySelector("line").getAttribute("stroke-dasharray")).toBe("7 4")
        expect(row.querySelector("svg").getAttribute("stroke")).toBe("#7f1d1d")
        expect(row.querySelector("svg polygon").getAttribute("fill")).toBe("#fff")
        expect(screen.getByRole("region", { name: "Uses" }).textContent).toContain("weapon.ts4")
    })

    it("should mark a declaration by the letter of its kind and a file by an icon", async () => {
        // Act
        await renderPanel()

        // Assert
        const uses = screen.getByRole("region", { name: "Uses" })
        expect(within(uses).getAllByTitle("Interface")[0].textContent).toBe("I")
        expect(within(uses).getByRole("button", { name: "weapon.ts" }).querySelector("i.fa-file-o")).not.toBeNull()
    })

    it("should go to the file or declaration a row names", async () => {
        // Arrange
        const { refChosen } = await renderPanel()
        const row = screen.getByTestId("dependency-panel-row")

        // Act
        await userEvent.click(within(row).getByRole("button", { name: "Weapon" }))
        await userEvent.click(screen.getByRole("button", { name: "weapon.ts" }))

        // Assert
        expect(refChosen.mock.calls).toEqual([[WEAPON], [WEAPON_FILE]])
    })

    it("should point at a row's dependency while the pointer or the focus is on it", async () => {
        // Arrange
        const { dependenciesPointedAt } = await renderPanel()
        const row = screen.getByTestId("dependency-panel-row")

        // Act
        fireEvent.mouseEnter(row)
        fireEvent.mouseLeave(row)
        fireEvent.focusIn(row)
        fireEvent.focusOut(row)

        // Assert
        expect(dependenciesPointedAt.mock.calls).toEqual([[[LEAF_EDGE]], [null], [[LEAF_EDGE]], [null]])
    })

    it("should tell a cycle as its chain, point at the whole chain and show it in the graph on request", async () => {
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
        expect(cycle.textContent.replaceAll(/\s+/g, "")).toContain("CCreature→IWeapon→CCreature")
        expect(pointedAt).toEqual([[FILE_MODEL.cycles[0].leafEdges], [null], [FILE_MODEL.cycles[0].leafEdges], [null]])
        expect(screen.getByTestId("dependency-panel-cycle-where").textContent.replaceAll(/\s+/g, " ").trim()).toBe(
            "2 declarations · across creature.ts, weapon.ts"
        )
        expect(cycleShown).toHaveBeenCalledWith(FILE_MODEL.cycles[0])
    })

    it("should offer the selection's action, the rows a hub left out and to close the panel", async () => {
        // Arrange
        const { actionChosen, allRowsRequested, closed } = await renderPanel()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Open in graph" }))
        await userEvent.click(screen.getByRole("button", { name: "and 2 more" }))
        await userEvent.click(screen.getByRole("button", { name: "and 3 more" }))
        await userEvent.click(screen.getByRole("button", { name: "Close details" }))

        // Assert
        expect(actionChosen).toHaveBeenCalledWith("open")
        expect(allRowsRequested).toHaveBeenCalledTimes(2)
        expect(closed).toHaveBeenCalledTimes(1)
    })

    it("should show only what a selection has: an edge's facts and dependencies without lists or cycles, a regular row without a type", async () => {
        // Arrange
        const edgeModel: PanelModel = {
            kind: "edge",
            title: "creature.ts → weapon.ts",
            subtitle: "Dependency",
            path: "/root/creature.ts|/root/weapon.ts",
            facts: [{ label: "Dependencies", value: "1" }],
            lists: [{ title: "Files", count: 0, refs: [], hiddenCount: 0 }],
            sections: [
                {
                    title: "Stands for",
                    count: 1,
                    groups: [
                        {
                            heading: null,
                            dependencies: [{ ...DEPENDENCY, usages: [], type: "regular", line: { dash: null, head: "dot" } }],
                            hiddenCount: 0
                        }
                    ]
                }
            ],
            cycles: [],
            action: "unfold"
        }

        // Act
        await renderPanel(edgeModel)

        // Assert
        expect(screen.getByRole("button", { name: "Unfold in graph" })).not.toBeNull()
        expect(screen.queryByTestId("dependency-panel-cycles")).toBeNull()
        expect(screen.queryByRole("region", { name: "Files" })).toBeNull()
        expect(screen.getByTestId("dependency-panel-row").textContent).not.toContain("Inherits")
        expect(screen.queryByTestId("dependency-panel-row-type")).toBeNull()
        expect(screen.getByTestId("dependency-panel-row").querySelector("circle")).not.toBeNull()
    })

    it("should show no facts and no action for a selection without any", async () => {
        // Arrange
        const bare: PanelModel = { ...FILE_MODEL, facts: [], action: null }

        // Act
        await renderPanel(bare)

        // Assert
        expect(screen.queryByTestId("dependency-panel-facts")).toBeNull()
        expect(screen.queryByTestId("dependency-panel-action")).toBeNull()
    })

    it("should bring the cycles into view when asked to, once per request, and set them off until another selection", async () => {
        // Arrange
        const scrollIntoView = jest.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        const { rerender, fixture } = await renderPanel(FILE_MODEL, 0)

        // Act
        await rerender({ inputs: { model: FILE_MODEL, cyclesRequest: 1, edgeColors: EDGE_COLORS } })
        fixture.detectChanges()
        const setOff = screen.getByTestId("dependency-panel-cycles").className
        await rerender({ inputs: { model: { ...FILE_MODEL, path: "/root/other.ts" }, cyclesRequest: 1, edgeColors: EDGE_COLORS } })
        fixture.detectChanges()

        // Assert
        expect(scrollIntoView).toHaveBeenCalledTimes(1)
        expect(setOff).toContain("border-info")
        expect(screen.getByTestId("dependency-panel-cycles").className).not.toContain("border-info")
    })
})
