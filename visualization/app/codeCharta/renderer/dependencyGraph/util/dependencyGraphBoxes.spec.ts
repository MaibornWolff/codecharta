import { BoxEmphasis, drawBox, drawFolderTitle, drawLevelBand } from "./dependencyGraphBoxes"
import { SELECTED_COLOR } from "./dependencyGraphStyle"
import { aBand, aBox, identityPixels } from "./dependencyGraphTestData"

interface DrawnElement {
    type: string
    info?: string
    shape?: Record<string, unknown>
    style?: Record<string, unknown>
    children?: DrawnElement[]
}

function look(emphasis: BoxEmphasis, isSeeThrough = false, isMissedBySearch = false) {
    return { emphasis, isSeeThrough, isMissedBySearch }
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

        it("should leave an open folder's name to its title, which is painted over the edges", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true, isExpanded: true, width: 400, height: 200 })

            // Act
            const children = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(children.map(child => child.type)).toEqual(["rect"])
        })

        it("should centre a closed folder's name across its whole box", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true, x: 0 })

            // Act
            const [, label] = childrenOf(drawBox(box, look("none"), identityPixels))

            // Assert
            expect(label.style).toMatchObject({ text: "app", x: 80, align: "center", width: 144 })
        })

        it("should leave out the name when the box is too small on screen", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true })
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
            const box = aBox("/root/app", { isFolder: true, isExpanded: true, depth: 1, width: 400, height: 200 })

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
            const box = aBox("/root/app", { isFolder: true, isExpanded: true, width: 400, height: 200 })

            // Act
            const children = childrenOf(drawFolderTitle(box, look("none"), identityPixels))

            // Assert
            expect(children).toHaveLength(1)
            expect(children[0].style).toMatchObject({ text: "app", align: "left", y: 14, opacity: 1 })
        })

        it("should fade the name of a folder the search missed", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true, isExpanded: true, width: 400, height: 200 })

            // Act
            const [title] = childrenOf(drawFolderTitle(box, look("none", false, true), identityPixels))

            // Assert
            expect(title.style.opacity).toBe(0.3)
        })

        it("should draw no name for a folder too narrow on screen", () => {
            // Arrange
            const box = aBox("/root/app", { isFolder: true, isExpanded: true, width: 40, height: 200 })

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
