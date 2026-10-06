import { DeclarationKindMark } from "../../../model/dependencyGraph.model"
import { CycleLook } from "./boxMarks"
import { BoxEmphasis, BoxLook, drawBox, drawFolderTitle, drawLevelBand } from "./dependencyGraphBoxes"
import { SELECTED_COLOR } from "./dependencyGraphStyle"
import { aBand, aBox, identityPixels } from "./dependencyGraphTestData"

interface DrawnElement {
    type: string
    info?: string
    shape?: Record<string, unknown> & { points?: number[][] }
    style?: Record<string, unknown>
    children?: DrawnElement[]
}

function look(emphasis: BoxEmphasis, isSeeThrough = false, isMissedBySearch = false, kindMark: DeclarationKindMark = "off"): BoxLook {
    return { emphasis, isSeeThrough, isMissedBySearch, kindMark, cycle: NO_CYCLE }
}

function childrenOf(element: object): DrawnElement[] {
    return (element as DrawnElement).children
}

const NO_CYCLE: CycleLook = { hiddenCount: 0, isInCycle: false, color: "" }

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

        it("should give a closed file that holds declarations a toggle and their count", () => {
            // Arrange
            const box = aBox("/root/a.ts", { declarationCount: 3 })

            // Act
            const [, label, toggle, countDisc, count] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(label.style).toMatchObject({ text: "a.ts", width: 112 })
            expect(toggle).toMatchObject({ info: "toggle", style: { text: "▸" } })
            expect(countDisc).toMatchObject({ type: "circle", shape: { cx: 146, cy: 20, r: 7 }, style: { stroke: "#8a94a3" } })
            expect(count.style).toMatchObject({ text: "3", x: 146, fill: "#8a94a3" })
        })

        it("should not count the one declaration a file's name already stands for, nor mark a file without any", () => {
            // Arrange
            const single = aBox("/root/a.ts", { declarationCount: 1 })
            const plain = aBox("/root/b.ts", { declarationCount: 0 })

            // Act
            const drawn = [single, plain].map(box => childrenOf(drawBox(box, look("none"), identityPixels)).map(child => child.style.text))

            // Assert
            expect(drawn).toEqual([
                [undefined, "a.ts", "▸"],
                [undefined, "b.ts"]
            ])
        })

        it("should head an opened file with its name and a toggle to close it, painted over the edges", () => {
            // Arrange
            const box = aBox("/root/a.ts", { declarationCount: 3, isExpanded: true, width: 300, height: 140 })

            // Act
            const outline = childrenOf(drawBox(box, look("none"), identityPixels))
            const [label, toggle, ...rest] = childrenOf(drawFolderTitle(box, look("none"), identityPixels))

            // Assert
            expect(outline.map(child => child.type)).toEqual(["rect"])
            expect(label.style).toMatchObject({ text: "a.ts", align: "left", x: 24, y: 14, fontWeight: "normal" })
            expect(toggle.style.text).toBe("▾")
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

        it("should name a listed declaration's level at its right, and leave the name that much less room", () => {
            // Arrange
            const box = aBox("/root/a.ts/Creature", { kind: "declaration", x: 0, y: 0, width: 132, height: 26, listedLevel: 3 })

            // Act
            const [, label, level] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(level.style).toMatchObject({ text: "3", x: 125, y: 13, align: "right", fill: "#8a94a3" })
            expect(label.style).toMatchObject({ x: 60, width: 104 })
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
            const iconLook = look("none", false, false, "icon")

            it("should shrink the marks inside a box with the box, keeping them in their place", () => {
                // Act
                const [, , toggle, countDisc, count] = childrenOf(drawBox(file, look("none"), atZoom(0.75)))
                const [, , icon, letter] = childrenOf(drawBox(declaration, iconLook, atZoom(0.75)))

                // Assert
                expect(toggle.style.fontSize).toBe(7.5)
                expect(countDisc.shape).toMatchObject({ cx: 109.5, cy: 15, r: 5.25 })
                expect(count.style.fontSize).toBe(7.5)
                expect(icon.shape).toMatchObject({ cx: 10.5, cy: 9.75, r: 5.25 })
                expect(letter.style.fontSize).toBe(7.5)
            })

            it("should leave the marks out once they would be too small to read, and give their room to the name", () => {
                // Act
                const fileParts = childrenOf(drawBox(file, look("none"), atZoom(0.5)))
                const declarationParts = childrenOf(drawBox(declaration, iconLook, atZoom(0.5)))

                // Assert
                expect(fileParts.map(part => part.type)).toEqual(["rect", "text"])
                expect(fileParts[1].style).toMatchObject({ text: "a.ts", width: 64, x: 40 })
                expect(declarationParts.map(part => part.type)).toEqual(["rect", "text"])
            })

            it("should keep the marks at their size when zoomed in, as the names keep theirs", () => {
                // Act
                const [, , icon] = childrenOf(drawBox(declaration, iconLook, atZoom(3)))

                // Assert
                expect(icon.shape).toMatchObject({ cx: 14, r: 7 })
            })

            it("should shrink a cycle badge and a cycle ring only so far, since they lead to the cycles from far out", () => {
                // Arrange
                const cyclic = { ...look("none"), cycle: { hiddenCount: 7, isInCycle: true, color: "#2563eb" } }

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
                const [, label, icon, letter] = childrenOf(drawBox(box, look("none", false, false, "icon"), identityPixels))

                // Assert
                expect(icon).toMatchObject({
                    type: "circle",
                    shape: { cx: 14, cy: 13, r: 7 },
                    style: { fill: "#dff3e4", stroke: "#7d8898" }
                })
                expect(letter.style).toMatchObject({ text: "I", x: 14, y: 13, fill: "#374151" })
                expect(label.style).toMatchObject({ x: 75, width: 98 })
            })

            it("should dash an interface's outline, frame an enum twice and point an annotation's box when the shape tells the kind", () => {
                // Arrange
                const shaped = look("selected", false, false, "shape")

                // Act
                const [interfaceBox, enumBox, annotationBox, classBox] = ["interface", "enum", "annotation", "class"].map(kind =>
                    childrenOf(drawBox(declaration(kind), shaped, identityPixels))
                )

                // Assert
                expect(interfaceBox[0].style.lineDash).toEqual([4, 3])
                expect(enumBox.slice(0, 2).map(part => part.shape)).toMatchObject([
                    { x: 0, y: 0, width: 132, height: 26 },
                    { x: 2.5, y: 2.5, width: 127, height: 21 }
                ])
                expect(annotationBox[0].shape.points).toEqual([
                    [8, 0],
                    [124, 0],
                    [132, 13],
                    [124, 26],
                    [8, 26],
                    [0, 13]
                ])
                expect(annotationBox[0].style.stroke).toBe(SELECTED_COLOR)
                expect(classBox.map(part => part.type)).toEqual(["rect", "text"])
                expect(classBox[0].style.lineDash).toBeNull()
            })

            it("should fill the box in the kind's tint, and leave the box plain when the kind is not shown", () => {
                // Arrange
                const box = declaration("enum")

                // Act
                const [tinted] = childrenOf(drawBox(box, look("none", false, false, "tint"), identityPixels))
                const plain = childrenOf(drawBox(box, look("none"), identityPixels))

                // Assert
                expect(tinted.style.fill).toBe("#fdecc8")
                expect(plain.map(child => child.type)).toEqual(["rect", "text"])
                expect(plain[0].style).toMatchObject({ fill: "#f7f9fc", stroke: "#9aa5b4" })
            })

            it("should not mark a file by the kind setting", () => {
                // Arrange
                const file = aBox("/root/a.ts")

                // Act
                const children = childrenOf(drawBox(file, look("none", false, false, "icon"), identityPixels))

                // Assert
                expect(children.map(child => child.type)).toEqual(["rect", "text"])
            })
        })

        describe("cycle marks", () => {
            const cyclic = (cycle: Partial<CycleLook>): BoxLook => ({ ...look("none"), cycle: { ...NO_CYCLE, color: "#2563eb", ...cycle } })

            it("should count the cycles a closed box hides in a pill hanging over its upper right corner", () => {
                // Arrange
                const box = aBox("/root/app", { kind: "folder", x: 10, y: 20 })

                // Act
                const [, , pill, arc, arrowHead, count] = childrenOf(drawBox(box, cyclic({ hiddenCount: 7 }), identityPixels))

                // Assert
                expect(pill).toMatchObject({
                    type: "rect",
                    info: "cycleBadge",
                    shape: { x: 148, y: 11, width: 28, height: 15 },
                    style: { fill: "#2563eb" }
                })
                expect([arc, arrowHead].map(part => part.type)).toEqual(["path", "path"])
                expect(count).toMatchObject({ info: "cycleBadge", style: { text: "7", x: 165 } })
            })

            it("should show the sign of a cycle alone for a single hidden cycle, and cap a large count", () => {
                // Arrange
                const box = aBox("/root/a.ts")

                // Act
                const single = childrenOf(drawBox(box, cyclic({ hiddenCount: 1 }), identityPixels))
                const many = childrenOf(drawBox(box, cyclic({ hiddenCount: 250 }), identityPixels))

                // Assert
                expect(single.map(part => part.type)).toEqual(["rect", "text", "rect", "path", "path"])
                expect(single[2].shape).toMatchObject({ width: 15, height: 15 })
                expect(many.at(-1).style.text).toBe("99+")
            })

            it("should draw no badge on a box that hides no cycle, nor on an open one", () => {
                // Arrange
                const closed = aBox("/root/a.ts")
                const open = aBox("/root/app", { kind: "folder", isExpanded: true })

                // Act
                const drawn = [drawBox(closed, cyclic({}), identityPixels), drawBox(open, cyclic({ hiddenCount: 3 }), identityPixels)]

                // Assert
                expect(drawn.map(item => childrenOf(item).map(child => child.type))).toEqual([["rect", "text"], ["rect"]])
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
                    style: { stroke: "#2563eb", fill: "#ffffff" }
                })
                expect(unringed.map(child => child.type)).toEqual(["rect", "text"])
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

    describe("drawFolderTitle", () => {
        it("should name an open folder in its header", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 400, height: 200 })

            // Act
            const children = childrenOf(drawFolderTitle(box, look("none"), identityPixels))

            // Assert
            expect(children).toHaveLength(1)
            expect(children[0].style).toMatchObject({ text: "app", align: "left", y: 14, opacity: 1 })
        })

        it("should fade the name of a folder the search missed", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 400, height: 200 })

            // Act
            const [title] = childrenOf(drawFolderTitle(box, look("none", false, true), identityPixels))

            // Assert
            expect(title.style.opacity).toBe(0.3)
        })

        it("should draw no name for a folder too narrow on screen", () => {
            // Arrange
            const box = aBox("/root/app", { kind: "folder", isExpanded: true, width: 40, height: 200 })

            // Act
            const children = childrenOf(drawFolderTitle(box, look("none"), identityPixels))

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
