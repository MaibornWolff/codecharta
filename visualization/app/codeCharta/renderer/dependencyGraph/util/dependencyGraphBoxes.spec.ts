import { DeclarationKindMark } from "../../../model/dependencyGraph.model"
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
    return { emphasis, isSeeThrough, isMissedBySearch, kindMark }
}

function childrenOf(element: object): DrawnElement[] {
    return (element as DrawnElement).children
}

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
            const [, label, toggle, count] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(label.style).toMatchObject({ text: "a.ts", width: 112 })
            expect(toggle).toMatchObject({ info: "toggle", style: { text: "▸" } })
            expect(count.style).toMatchObject({ text: "3", align: "right", x: 152 })
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

        it("should draw a declaration smaller and lighter than a file", () => {
            // Arrange
            const box = aBox("/root/a.ts/Creature", { kind: "declaration", declarationKind: "class", width: 132, height: 26 })

            // Act
            const [rect, label] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(rect.style).toMatchObject({ fill: "#ffffff", stroke: "#b9c1cc" })
            expect(label.style).toMatchObject({ text: "Creature", fontSize: 11 })
        })

        describe("declaration kind", () => {
            const declaration = (declarationKind: string) =>
                aBox("/root/a.ts/Creature", { kind: "declaration", declarationKind, x: 0, y: 0, width: 132, height: 26 })

            it("should put a lettered icon in the kind's colour before the name", () => {
                // Arrange
                const box = declaration("interface")

                // Act
                const [, label, icon, letter] = childrenOf(drawBox(box, look("none", false, false, "icon"), identityPixels))

                // Assert
                expect(icon).toMatchObject({ type: "rect", shape: { x: 8, y: 6, width: 14, height: 14 }, style: { fill: "#15803d" } })
                expect(letter.style).toMatchObject({ text: "I", x: 15, y: 13 })
                expect(label.style).toMatchObject({ x: 75, width: 98 })
            })

            it.each([
                ["class", "rect", { r: 4 }],
                ["interface", "rect", { r: 13 }],
                ["enum", "rect", { r: 0 }]
            ])("should outline a %s as a %s when the shape tells the kind", (declarationKind, type, shape) => {
                // Arrange
                const box = declaration(declarationKind)

                // Act
                const [outline] = childrenOf(drawBox(box, look("none", false, false, "shape"), identityPixels))

                // Assert
                expect(outline).toMatchObject({ type, shape })
            })

            it("should point a function's box at both ends and slant a variable's", () => {
                // Arrange
                const boxes = [declaration("function"), declaration("variable")]

                // Act
                const [hexagon, slanted] = boxes.map(
                    box => childrenOf(drawBox(box, look("selected", false, false, "shape"), identityPixels))[0]
                )

                // Assert
                expect(hexagon.shape.points).toHaveLength(6)
                expect(slanted.shape.points).toEqual([
                    [9.1, 0],
                    [132, 0],
                    [122.9, 26],
                    [0, 26]
                ])
                expect(hexagon.style.stroke).toBe(SELECTED_COLOR)
            })

            it("should fill the box in the kind's tint, and leave the box plain when the kind is not shown", () => {
                // Arrange
                const box = declaration("enum")

                // Act
                const [tinted] = childrenOf(drawBox(box, look("none", false, false, "tint"), identityPixels))
                const plain = childrenOf(drawBox(box, look("none"), identityPixels))

                // Assert
                expect(tinted.style.fill).toBe("#f3e8ff")
                expect(plain.map(child => child.type)).toEqual(["rect", "text"])
                expect(plain[0].style.fill).toBe("#ffffff")
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
