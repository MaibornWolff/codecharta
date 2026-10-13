import { CycleLook } from "./boxMarks"
import { BoxEmphasis, BoxLook, drawBox, drawContainerTitle, drawLevelBand } from "./dependencyGraphBoxes"
import { SELECTED_COLOR } from "./dependencyGraphStyle"
import { aBand, aBox, identityPixels } from "./dependencyGraphTestData"
import { LayoutBox } from "./layoutModel"

interface DrawnElement {
    type: string
    info?: string
    cursor?: string
    shape?: Record<string, unknown> & { points?: number[][] }
    style?: Record<string, unknown>
    children?: DrawnElement[]
}

function look(emphasis: BoxEmphasis, isSeeThrough = false, isMissedBySearch = false): BoxLook {
    return { emphasis, isSeeThrough, isMissedBySearch, cycle: NO_CYCLE }
}

function childrenOf(element: object): DrawnElement[] {
    return (element as DrawnElement).children
}

const NO_CYCLE: CycleLook = { insideFilesCount: 0, betweenFilesCount: 0, isInCycle: false }

describe("dependencyGraphBoxes", () => {
    describe("drawBox", () => {
        it("should centre a file's name in its box", () => {
            // Arrange
            const box = aBox("/root/a.ts", { x: 10, y: 20 })

            // Act
            const [rect, label] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(rect.shape).toMatchObject({ x: 10, y: 20, width: 160, height: 40 })
            expect(label.style).toMatchObject({ text: "a.ts", x: 90, y: 40, align: "center", overflow: "truncate" })
        })

        it("should give a closed file that holds declarations their count and nothing else", () => {
            // Arrange
            const box = aBox("/root/a.ts", { declarationCount: 3 })

            // Act
            const [, , label, countDisc, count, ...rest] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(label.style).toMatchObject({ text: "a.ts", width: 112 })
            expect(rest).toEqual([])
            expect(countDisc).toMatchObject({ type: "circle", shape: { cx: 146, cy: 20, r: 7 }, style: { stroke: "#8a94a3" } })
            expect(count.style).toMatchObject({ text: "3", x: 146, fill: "#8a94a3" })
        })

        it("should lay a closed file that holds declarations on a second sheet and give it a hand cursor, as it opens; no other box", () => {
            // Arrange
            const openable = aBox("/root/a.ts", { declarationCount: 1, x: 10, y: 20 })
            const plain = aBox("/root/b.ts", { declarationCount: 0 })
            const opened = aBox("/root/c.ts", { declarationCount: 2, isExpanded: true, width: 300, height: 140 })
            const closedFolder = aBox("/root/app", { kind: "folder" })
            const rectsOf = (box: LayoutBox) =>
                childrenOf(drawBox(box, look("selected"), identityPixels)).filter(part => part.type === "rect")

            // Act
            const [sheet, front] = rectsOf(openable)

            // Assert
            expect(sheet).toMatchObject({
                cursor: "pointer",
                shape: { x: 14, y: 24, width: 160, height: 40 },
                style: { stroke: "#9aa5b4", fill: null }
            })
            expect(front).toMatchObject({ cursor: "pointer", shape: { x: 10, y: 20 }, style: { stroke: SELECTED_COLOR } })
            expect([plain, opened].map(box => rectsOf(box).map(rect => rect.cursor))).toEqual([[undefined], [undefined]])
            expect(rectsOf(closedFolder).map(rect => rect.cursor)).toEqual(["pointer"])
        })

        it("should not count the one declaration a file's name already stands for, nor mark a file without any", () => {
            // Arrange
            const single = aBox("/root/a.ts", { declarationCount: 1 })
            const plain = aBox("/root/b.ts", { declarationCount: 0 })

            // Act
            const drawn = [single, plain].map(box => childrenOf(drawBox(box, look("none"), identityPixels)).map(child => child.style.text))

            // Assert
            expect(drawn).toEqual([
                [undefined, undefined, "a.ts"],
                [undefined, "b.ts"]
            ])
        })

        it("should head an opened file with its name alone, painted over the edges", () => {
            // Arrange
            const box = aBox("/root/a.ts", { declarationCount: 3, isExpanded: true, width: 300, height: 140 })

            // Act
            const outline = childrenOf(drawBox(box, look("none"), identityPixels))
            const [label, ...rest] = childrenOf(drawContainerTitle(box, look("none"), identityPixels))

            // Assert
            expect(outline.map(child => child.type)).toEqual(["rect"])
            expect(label.style).toMatchObject({ text: "a.ts", align: "left", x: 8, y: 14, fontWeight: "normal" })
            expect(rest).toEqual([])
        })

        it("should draw a declaration with a smaller name on a fill of its own", () => {
            // Arrange
            const box = aBox("/root/a.ts/Creature", { kind: "declaration", declarationKind: "class", width: 132, height: 26 })

            // Act
            const [rect, label] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(rect.style).toMatchObject({ fill: "#f7f9fc", stroke: "#9aa5b4" })
            expect(label.style).toMatchObject({ text: "Creature", fontSize: 11 })
        })

        describe("zoomed out", () => {
            const atZoom =
                (zoom: number) =>
                ([x, y]: [number, number]) => [x * zoom, y * zoom]
            const file = aBox("/root/a.ts", { declarationCount: 3, x: 0, y: 0 })
            const declaration = aBox("/root/a.ts/Creature", {
                kind: "declaration",
                declarationKind: "class",
                x: 0,
                y: 0,
                width: 132,
                height: 26
            })
            const iconLook = look("none")

            it("should shrink the marks inside a box with the box, keeping them in their place", () => {
                // Arrange
                const zoomedOutALittle = atZoom(0.75)

                // Act
                const [, , , countDisc, count] = childrenOf(drawBox(file, look("none"), zoomedOutALittle))
                const [, , icon, letter] = childrenOf(drawBox(declaration, iconLook, zoomedOutALittle))

                // Assert
                expect(countDisc.shape).toMatchObject({ cx: 109.5, cy: 15, r: 5.25 })
                expect(count.style.fontSize).toBe(7.5)
                expect(icon.shape).toMatchObject({ cx: 10.5, cy: 9.75, r: 5.25 })
                expect(letter.style.fontSize).toBe(7.5)
            })

            it("should leave the marks out once they would be too small to read, and give their room to the name", () => {
                // Arrange
                const zoomedOutFar = atZoom(0.5)

                // Act
                const fileParts = childrenOf(drawBox(file, look("none"), zoomedOutFar))
                const declarationParts = childrenOf(drawBox(declaration, iconLook, zoomedOutFar))

                // Assert
                expect(fileParts.map(part => part.type)).toEqual(["rect", "rect", "text"])
                expect(fileParts[2].style).toMatchObject({ text: "a.ts", width: 64, x: 40 })
                expect(declarationParts.map(part => part.type)).toEqual(["rect", "text"])
            })

            it("should keep the marks at their size when zoomed in, as the names keep theirs", () => {
                // Arrange
                const zoomedIn = atZoom(3)

                // Act
                const [, , icon] = childrenOf(drawBox(declaration, iconLook, zoomedIn))

                // Assert
                expect(icon.shape).toMatchObject({ cx: 14, r: 7 })
            })

            it("should shrink a cycle badge and a cycle ring only so far, since they lead to the cycles from far out", () => {
                // Arrange
                const cyclic = { ...look("none"), cycle: { insideFilesCount: 7, betweenFilesCount: 0, isInCycle: true } }

                // Act
                const pill = childrenOf(drawBox(aBox("/root/app", { kind: "folder", x: 0, y: 0 }), cyclic, atZoom(0.2))).find(
                    part => part.info === "cycleBadge"
                )
                const ring = childrenOf(drawBox(declaration, cyclic, atZoom(0.2))).at(-1)

                // Assert
                expect(pill.shape).toMatchObject({ height: 10.5 })
                expect(ring.shape.r).toBeCloseTo(2.45)
            })
        })

        describe("declaration kind", () => {
            const declaration = (declarationKind: string) =>
                aBox("/root/a.ts/Creature", { kind: "declaration", declarationKind, x: 0, y: 0, width: 132, height: 26 })

            it("should put a round lettered icon in the kind's tint before the name", () => {
                // Arrange
                const box = declaration("interface")

                // Act
                const [, label, icon, letter] = childrenOf(drawBox(box, look("none"), identityPixels))

                // Assert
                expect(icon).toMatchObject({
                    type: "circle",
                    shape: { cx: 14, cy: 13, r: 7 },
                    style: { fill: "#dff3e4", stroke: "#7d8898" }
                })
                expect(letter.style).toMatchObject({ text: "I", x: 14, y: 13, fill: "#374151" })
                expect(label.style).toMatchObject({ x: 75, width: 98 })
            })

            it("should give a file no kind icon", () => {
                // Arrange
                const file = aBox("/root/a.ts")

                // Act
                const children = childrenOf(drawBox(file, look("none"), identityPixels))

                // Assert
                expect(children.map(child => child.type)).toEqual(["rect", "text"])
            })
        })

        describe("cycle marks", () => {
            const cyclic = (cycle: Partial<CycleLook>): BoxLook => ({ ...look("none"), cycle: { ...NO_CYCLE, ...cycle } })

            it("should count the cycles inside the files of a closed box in an outlined badge hanging over its upper right corner", () => {
                // Arrange
                const box = aBox("/root/app", { kind: "folder", x: 10, y: 20 })

                // Act
                const [, , pill, arc, arrowHead, count] = childrenOf(drawBox(box, cyclic({ insideFilesCount: 7 }), identityPixels))

                // Assert
                expect(pill).toMatchObject({
                    type: "rect",
                    info: "cycleBadge",
                    shape: { x: 148, y: 11, width: 28, height: 15 },
                    style: { fill: "#ffffff", stroke: "#dc2626" }
                })
                expect([arc, arrowHead].map(part => part.type)).toEqual(["path", "path"])
                expect(count).toMatchObject({ info: "cycleBadge", style: { text: "7", x: 165 } })
            })

            it("should number a single cycle too, and cap a large count", () => {
                // Arrange
                const box = aBox("/root/a.ts")

                // Act
                const single = childrenOf(drawBox(box, cyclic({ insideFilesCount: 1 }), identityPixels))
                const many = childrenOf(drawBox(box, cyclic({ insideFilesCount: 250 }), identityPixels))

                // Assert
                expect(single.map(part => part.type)).toEqual(["rect", "text", "rect", "path", "path", "text"])
                expect(single[2].shape).toMatchObject({ width: 28, height: 15 })
                expect(single.at(-1).style.text).toBe("1")
                expect(many.at(-1).style.text).toBe("99+")
            })

            it("should draw no badge on a box that is in no cycle, and none on the outline of an open one", () => {
                // Arrange
                const closed = aBox("/root/a.ts")
                const open = aBox("/root/app", { kind: "folder", isExpanded: true })

                // Act
                const drawn = [drawBox(closed, cyclic({}), identityPixels), drawBox(open, cyclic({ betweenFilesCount: 3 }), identityPixels)]

                // Assert
                expect(drawn.map(item => childrenOf(item).map(child => child.type))).toEqual([["rect", "text"], ["rect"]])
            })

            it("should draw the between-files badge filled, to the right of the outlined inside-files badge", () => {
                // Arrange
                const box = aBox("/root/a.ts", { x: 10, y: 20 })

                // Act
                const pills = childrenOf(drawBox(box, cyclic({ insideFilesCount: 2, betweenFilesCount: 3 }), identityPixels)).filter(
                    part => part.type === "rect" && part.info === "cycleBadge"
                )

                // Assert
                expect(pills.map(pill => pill.style)).toMatchObject([
                    { fill: "#ffffff", stroke: "#dc2626" },
                    { fill: "#dc2626", stroke: "#ffffff" }
                ])
                expect(pills.map(pill => pill.shape)).toMatchObject([
                    { x: 117, width: 28 },
                    { x: 148, width: 28 }
                ])
            })

            it("should keep the between-files badge on the title of an opened file", () => {
                // Arrange
                const open = aBox("/root/a.ts", { declarationCount: 2, isExpanded: true, x: 10, y: 20 })

                // Act
                const pills = childrenOf(drawContainerTitle(open, cyclic({ betweenFilesCount: 1 }), identityPixels)).filter(
                    part => part.type === "rect" && part.info === "cycleBadge"
                )

                // Assert
                expect(pills).toMatchObject([{ shape: { x: 148, width: 28 }, style: { fill: "#dc2626", stroke: "#ffffff" } }])
            })

            it("should ring a declaration that takes part in a cycle", () => {
                // Arrange
                const box = aBox("/root/a.ts/Creature", { kind: "declaration", x: 0, y: 0, width: 132, height: 26 })

                // Act
                const ring = childrenOf(drawBox(box, cyclic({ isInCycle: true }), identityPixels)).at(-1)
                const unringed = childrenOf(drawBox(box, cyclic({}), identityPixels))

                // Assert
                expect(ring).toMatchObject({
                    type: "circle",
                    shape: { cx: 131, cy: 1, r: 3.5 },
                    style: { stroke: "#dc2626", fill: "#ffffff" }
                })
                expect(unringed.map(child => child.type)).toEqual(["rect", "text", "circle", "text"])
            })
        })
        it("should tell a package from a folder by its colours, closed and open, and name it in bold", () => {
            // Arrange
            const closed = aBox("package:game", { kind: "package" })
            const open = aBox("package:game", { kind: "package", isExpanded: true, depth: 1 })

            // Act
            const [closedOutline, name] = childrenOf(drawBox(closed, look("none"), identityPixels))
            const [openOutline] = childrenOf(drawBox(open, look("none"), identityPixels))

            // Assert
            expect(closedOutline.style).toMatchObject({ fill: "#e6e0f7", stroke: "#8f7fc7" })
            expect(openOutline.style).toMatchObject({ fill: "#f0ecfa", stroke: "#c6bce2" })
            expect(name.style.fontWeight).toBe("bold")
        })

        it("should leave an open folder's name to its title, which is painted over the edges", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 400, height: 200 })

            // Act
            const children = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(children.map(child => child.type)).toEqual(["rect"])
        })

        it("should centre a closed folder's name across its whole box", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", x: 0 })

            // Act
            const [, label] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(label.style).toMatchObject({ text: "app", x: 80, align: "center", width: 144 })
        })

        it("should leave out the name when the box is too small on screen", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder" })
            const zoomedOut = ([x, y]: [number, number]) => [x / 4, y / 4]

            // Act
            const children = childrenOf(drawBox(box, look("none"), zoomedOut))

            // Assert
            expect(children).toHaveLength(1)
        })

        it("should outline the selected box", () => {
            // Arrange
            const box = aBox("/root/a.ts")

            // Act
            const [rect] = childrenOf(drawBox(box, look("selected"), identityPixels))

            // Assert
            expect(rect.style).toMatchObject({ stroke: SELECTED_COLOR, lineWidth: 2.5 })
        })

        it("should thicken the outline of the hovered box", () => {
            // Arrange
            const box = aBox("/root/a.ts")

            // Act
            const [rect] = childrenOf(drawBox(box, look("hovered"), identityPixels))

            // Assert
            expect(rect.style.lineWidth).toBe(2)
        })

        it("should let what lies behind a see-through box show through its fill", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, depth: 1, width: 400, height: 200 })

            // Act
            const [rect] = childrenOf(drawBox(box, look("none", true), identityPixels))

            // Assert
            expect(rect.style.fill).toBe("rgba(233, 237, 242, 0.65)")
        })

        it("should fade a box the search missed, its name included", () => {
            // Arrange
            const box = aBox("/root/a.ts")

            // Act
            const [rect, label] = childrenOf(drawBox(box, look("none", false, true), identityPixels))

            // Assert
            expect([rect.style.opacity, label.style.opacity]).toEqual([0.3, 0.3])
        })

        it("should state full opacity on a box the search found, so a box redrawn after a search is no longer faded", () => {
            // Arrange
            const box = aBox("/root/a.ts")

            // Act
            const [rect, label] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect([rect.style.opacity, label.style.opacity]).toEqual([1, 1])
        })
    })

    describe("drawContainerTitle", () => {
        it("should name an open folder in its header", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 400, height: 200 })

            // Act
            const children = childrenOf(drawContainerTitle(box, look("none"), identityPixels))

            // Assert
            expect(children).toHaveLength(1)
            expect(children[0].style).toMatchObject({ text: "app", align: "left", y: 14, opacity: 1 })
        })

        it("should fade the name of a folder the search missed", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 400, height: 200 })

            // Act
            const [title] = childrenOf(drawContainerTitle(box, look("none", false, true), identityPixels))

            // Assert
            expect(title.style.opacity).toBe(0.3)
        })

        it("should draw no name for a folder too narrow on screen", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 40, height: 200 })

            // Act
            const children = childrenOf(drawContainerTitle(box, look("none"), identityPixels))

            // Assert
            expect(children).toEqual([])
        })
    })

    describe("drawLevelBand", () => {
        it("should name the level and separate it from the level above", () => {
            // Arrange
            const band = aBand({ level: 2, levelPath: [0, 1, 2] })

            // Act
            const [label, separator] = childrenOf(drawLevelBand(band, identityPixels))

            // Assert
            expect(label.style.text).toBe("level 0.1.2")
            expect(separator.shape).toMatchObject({ y1: 82, y2: 82 })
        })

        it("should draw no separator above a folder's topmost level", () => {
            // Arrange
            const band = aBand({ isTopmost: true })

            // Act
            const children = childrenOf(drawLevelBand(band, identityPixels))

            // Assert
            expect(children).toHaveLength(1)
        })

        it("should stop the separator where a box from outside the folder covers it", () => {
            // Arrange
            const band = aBand({ x: 0, width: 400 })

            // Act
            const separators = childrenOf(drawLevelBand(band, identityPixels, { hiddenSpans: [[100, 200]], isLabelHidden: false })).slice(1)

            // Assert
            expect(separators.map(separator => [separator.shape.x1, separator.shape.x2])).toEqual([
                [12, 100],
                [200, 388]
            ])
        })

        it("should leave out a label that a box from outside the folder covers", () => {
            // Arrange
            const band = aBand({ isTopmost: true })

            // Act
            const children = childrenOf(drawLevelBand(band, identityPixels, { hiddenSpans: [], isLabelHidden: true }))

            // Assert
            expect(children).toHaveLength(0)
        })
    })
})
