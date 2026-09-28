import { drawBox, drawLevelBand, TOGGLE_INFO } from "./dependencyGraphBoxes"
import { SELECTED_COLOR } from "./dependencyGraphStyle"
import { aBand, aBox, identityPixels } from "./dependencyGraphTestData"

interface DrawnElement {
    type: string
    info?: string
    shape?: Record<string, unknown>
    style?: Record<string, unknown>
    children?: DrawnElement[]
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
            const [rect, label] = childrenOf(drawBox(box, "none", identityPixels))

            // Assert
            expect(rect.shape).toMatchObject({ x: 10, y: 20, width: 160, height: 40 })
            expect(label.style).toMatchObject({ text: "a.ts", x: 90, y: 40, align: "center", overflow: "truncate" })
        })

        it("should name an open folder in its header and offer a glyph to close it", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true, isExpanded: true, width: 400, height: 200 })

            // Act
            const [, label, toggle, glyph] = childrenOf(drawBox(box, "none", identityPixels))

            // Assert
            expect(label.style).toMatchObject({ text: "app", align: "left", y: 14 })
            expect(toggle.info).toBe(TOGGLE_INFO)
            expect(glyph.style.text).toBe("−")
        })

        it("should offer a glyph to open a closed folder", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true })

            // Act
            const glyph = childrenOf(drawBox(box, "none", identityPixels)).at(-1)

            // Assert
            expect(glyph.style.text).toBe("+")
        })

        it("should keep a small folder's name and leave out its glyph", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true })
            const zoomedOut = ([x, y]: [number, number]) => [x / 2, y / 2]

            // Act
            const children = childrenOf(drawBox(box, "none", zoomedOut))

            // Assert
            expect(children.map(child => child.style.text)).toEqual([undefined, "app"])
        })

        it("should leave out the name and the glyph when the box is too small on screen", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true })
            const zoomedOut = ([x, y]: [number, number]) => [x / 10, y / 10]

            // Act
            const children = childrenOf(drawBox(box, "none", zoomedOut))

            // Assert
            expect(children).toHaveLength(1)
        })

        it("should outline the selected box", () => {
            // Arrange
            const box = aBox("/root/a.ts")

            // Act
            const [rect] = childrenOf(drawBox(box, "selected", identityPixels))

            // Assert
            expect(rect.style).toMatchObject({ stroke: SELECTED_COLOR, lineWidth: 2.5 })
        })

        it("should thicken the outline of the hovered box", () => {
            // Arrange
            const box = aBox("/root/a.ts")

            // Act
            const [rect] = childrenOf(drawBox(box, "hovered", identityPixels))

            // Assert
            expect(rect.style.lineWidth).toBe(2)
        })
    })

    describe("drawLevelBand", () => {
        it("should name the level and separate it from the level above", () => {
            // Arrange
            const band = aBand({ level: 2 })

            // Act
            const [label, separator] = childrenOf(drawLevelBand(band, identityPixels))

            // Assert
            expect(label.style.text).toBe("level 2")
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
    })
})
