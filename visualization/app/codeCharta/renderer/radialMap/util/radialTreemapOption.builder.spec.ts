import { fileNode, folderNode, TEST_COLORING } from "../testing/radialChart.stub"
import { CENTRE_RADIUS } from "./radialChartStyle"
import { nodeColor } from "./radialColor"
import { RadialOptionInputs } from "./radialShape"
import { RadialNode } from "./radialTree"
import { buildRadialTreemapOption, RadialTreemapDatum, radialTreemapShape } from "./radialTreemapOption.builder"

const CHART_SIZE = { getWidth: () => 800, getHeight: () => 600 }
const SHORTER_HALF_SIDE_PX = 300

interface DrawnElement {
    type: string
    silent?: boolean
    z2: number
    x?: number
    y?: number
    rotation?: number
    shape?: Record<string, number | boolean>
    style: Record<string, unknown>
    blur?: { style: { opacity: number } }
    children?: DrawnElement[]
}

interface DrawnGroup {
    type: string
    focus: string
    children: DrawnElement[]
}

function leavesOf(elements: DrawnElement[]): DrawnElement[] {
    return elements.flatMap(element => (element.type === "group" ? leavesOf(element.children) : [element]))
}

function textsOf(group: DrawnGroup): DrawnElement[] {
    return leavesOf(group.children).filter(element => element.type === "text")
}

function inputs(centre: RadialNode, overrides: Partial<RadialOptionInputs> = {}): RadialOptionInputs {
    return {
        centre,
        isMapRoot: false,
        metrics: { areaMetric: "rloc", colorMetric: "mcc" },
        coloring: TEST_COLORING,
        chartSizeInPixels: 600,
        ...overrides
    }
}

const BAND_COUNT = 3

function drawn(centre: RadialNode, overrides: Partial<RadialOptionInputs> = {}, maxBandCount = BAND_COUNT) {
    const option = buildRadialTreemapOption(inputs(centre, overrides), maxBandCount)
    const [series] = option.series
    const data = series.data as RadialTreemapDatum[]
    const drawIndex = (dataIndex: number) => series.renderItem({ dataIndex }, CHART_SIZE) as DrawnGroup
    const drawItem = (path: string) => drawIndex(data.findIndex(datum => datum.name === path))
    return { option, series, data, drawIndex, drawItem }
}

const SRC = folderNode("/root/src", [fileNode("/root/src/a.ts", { area: 30 }), fileNode("/root/src/b.ts", { area: 10 })], { area: 40 })
const TREE = folderNode("/root", [SRC, fileNode("/root/readme.md", { area: 20 })], { area: 60 })

describe("buildRadialTreemapOption", () => {
    it("should draw every node once as a custom series item named by its path, the centre first", () => {
        // Act
        const { series, data } = drawn(TREE)

        // Assert
        expect(series.type).toBe("custom")
        expect(data.map(datum => datum.name)).toEqual(["/root", "/root/src", "/root/src/a.ts", "/root/src/b.ts", "/root/readme.md"])
        expect(data[0].isCentre).toBe(true)
        expect(data.filter(datum => datum.isCentre)).toHaveLength(1)
    })

    it("should key each item by the centre as well, so stepping to another folder draws its nodes afresh", () => {
        // Act
        const { data } = drawn(TREE)
        const { data: steppedIn } = drawn(SRC)

        // Assert
        expect(data.find(datum => datum.name === "/root/src/a.ts").id).not.toBe(steppedIn.find(datum => datum.name === "/root/src/a.ts").id)
        expect(new Set(data.map(datum => datum.id)).size).toBe(data.length)
    })

    it("should tell files from folders, and carry what the tooltip shows", () => {
        // Act
        const { data } = drawn(TREE)

        // Assert
        expect(data.find(datum => datum.name === "/root/src/a.ts")).toMatchObject({
            isFile: true,
            value: 30,
            displayName: "a.ts",
            colorValue: 5
        })
        expect(data.find(datum => datum.name === "/root/src").isFile).toBe(false)
    })

    it("should colour a node by its colour metric value, as the sunburst does", () => {
        // Arrange
        const hot = fileNode("/root/hot.ts", { colorValue: 50 })

        // Act
        const { data } = drawn(folderNode("/root", [hot]))

        // Assert
        expect(data[1].color).toBe(nodeColor(hot, TEST_COLORING))
    })

    it("should draw all pieces of a node as one group that dims the other nodes while it is hovered", () => {
        // Act
        const { drawItem } = drawn(TREE)
        const group = drawItem("/root/src")

        // Assert
        expect(group.type).toBe("group")
        expect(group.focus).toBe("self")
        expect(group.children.length).toBeGreaterThan(1)
        expect(leavesOf(group.children).every(child => child.blur.style.opacity < 1)).toBe(true)
    })

    it("should say of every element whether it takes the pointer, as a redraw keeps what an element was told before", () => {
        // Act
        const { data, drawIndex } = drawn(TREE)
        const elements = data.flatMap((_, dataIndex) => leavesOf(drawIndex(dataIndex).children))

        // Assert
        expect(elements.every(element => typeof element.silent === "boolean")).toBe(true)
        expect(elements.filter(element => element.type !== "text" && element.style.fill !== "none").every(element => !element.silent)).toBe(
            true
        )
    })

    it("should outline a folder's wedge without catching the pointer", () => {
        // Act
        const { drawItem } = drawn(TREE)
        const outlines = drawItem("/root/src").children.filter(child => child.type === "sector" && child.silent)

        // Assert
        expect(outlines).toHaveLength(1)
        expect(outlines[0].style.fill).toBe("none")
        expect(outlines[0].z2).toBeGreaterThan(drawItem("/root/src/a.ts").children[0].z2)
    })

    it("should draw every piece in one frame, so hovering a big map does not redraw it in sweeps", () => {
        // Act
        const { series } = drawn(TREE)

        // Assert
        expect(series.progressive).toBe(0)
    })

    it("should keep the white border on a piece wide enough for it", () => {
        // Act
        const [piece] = drawn(TREE).drawItem("/root/src/a.ts").children

        // Assert
        expect(piece.style.stroke).toBe("#ffffff")
    })

    it("should outline a piece too thin for a white border in its own colour, so tiny files do not fade to white", () => {
        // Arrange
        const tiny = fileNode("/root/big/tiny.ts", { area: 0.001 })
        const big = folderNode("/root/big", [fileNode("/root/big/huge.ts", { area: 1000 }), tiny], { area: 1000.001 })

        // Act
        const [piece] = drawn(folderNode("/root", [big], { area: 1000.001 })).drawItem("/root/big/tiny.ts").children

        // Assert
        expect(piece.style.stroke).toBe(piece.style.fill)
    })

    it("should leave out the outline of a wedge too thin to hold it", () => {
        // Arrange
        const thin = folderNode("/root/thin", [fileNode("/root/thin/a.ts", { area: 0.001 })], { area: 0.001 })
        const wide = folderNode("/root/wide", [fileNode("/root/wide/b.ts", { area: 1000 })], { area: 1000 })
        const { drawItem } = drawn(folderNode("/root", [wide, thin], { area: 1000.001 }))

        // Act
        const outlineOf = (path: string) => drawItem(path).children.find(child => child.type === "sector" && child.silent)

        // Assert
        expect(outlineOf("/root/thin").style.lineWidth).toBe(0)
        expect(outlineOf("/root/wide").style.lineWidth).toBeGreaterThan(0)
    })

    it("should start the first wedge at twelve o'clock around the middle of the chart", () => {
        // Act
        const { drawItem } = drawn(TREE)
        const [firstWedge] = drawItem("/root/src").children

        // Assert
        expect(firstWedge.shape).toMatchObject({ cx: 400, cy: 300, startAngle: -Math.PI / 2, clockwise: true })
    })

    it("should draw the centre as a disc sized to the shorter side of the chart", () => {
        // Act
        const { drawItem } = drawn(TREE)
        const [centreDisc] = drawItem("/root").children

        // Assert
        expect(centreDisc.type).toBe("circle")
        expect(centreDisc.shape).toMatchObject({ cx: 400, cy: 300 })
        expect(centreDisc.shape.r).toBeCloseTo(CENTRE_RADIUS * SHORTER_HALF_SIDE_PX)
    })

    it("should name the centre in bold in its middle", () => {
        // Act
        const { drawItem } = drawn(TREE)
        const label = drawItem("/root").children.find(child => child.type === "text")

        // Assert
        expect(label).toMatchObject({ x: 400, y: 300, rotation: 0 })
        expect(label.style).toMatchObject({ text: "root", fontWeight: "bold", overflow: "truncate" })
    })

    it("should leave out the label of a piece too small to hold it", () => {
        // Arrange
        const tiny = fileNode("/root/tiny.ts", { area: 0.001 })
        const centre = folderNode("/root", [fileNode("/root/big.ts", { area: 1000 }), tiny], { area: 1000.001 })

        // Act
        const { drawItem } = drawn(centre)

        // Assert
        expect(textsOf(drawItem("/root/tiny.ts"))).toHaveLength(0)
        expect(textsOf(drawItem("/root/big.ts")).length).toBeGreaterThan(0)
    })

    it("should keep every label upright", () => {
        // Arrange
        const folders = Array.from({ length: 12 }, (_, index) =>
            folderNode(`/root/d${index}`, [fileNode(`/root/d${index}/a.ts`, { area: 1 })], { area: 1 })
        )

        // Act
        const { data, drawIndex } = drawn(folderNode("/root", folders, { area: 12 }))
        const labels = data.flatMap((_, dataIndex) => textsOf(drawIndex(dataIndex)))

        // Assert
        expect(labels.length).toBeGreaterThan(1)
        expect(labels.every(label => Math.abs(Math.atan2(Math.sin(label.rotation), Math.cos(label.rotation))) <= Math.PI / 2)).toBe(true)
    })

    it("should offer going up in the centre's tooltip below the map root only", () => {
        // Act
        const { option } = drawn(TREE)
        const { option: atRoot } = drawn(TREE, { isMapRoot: true })
        const centre = { data: { name: "/root", value: 60, colorValue: 5, folderValueText: undefined, isCentre: true } }

        // Assert
        expect(option.tooltip.formatter(centre)).toContain("Click to go up one folder")
        expect(atRoot.tooltip.formatter(centre)).not.toContain("Click to go up one folder")
    })

    it("should place every piece itself, as a piece that takes the place of a label keeps the label's position otherwise", () => {
        // Act
        const { data, drawIndex } = drawn(TREE)
        const pieces = data.flatMap((_, dataIndex) => drawIndex(dataIndex).children.filter(child => child.type !== "text"))

        // Assert
        expect(pieces.every(piece => piece.x === 0 && piece.y === 0 && piece.rotation === 0)).toBe(true)
    })

    it("should curve a name that runs along an arc, letter by letter on the arc's middle", () => {
        // Arrange
        const wideFile = fileNode("/root/wide.ts", { area: 90 })
        const centre = folderNode("/root", [wideFile, fileNode("/root/b.ts", { area: 10 })], { area: 100 })

        // Act
        const { drawItem } = drawn(centre)
        const [wedge, curvedLabel] = drawItem(wideFile.path).children

        // Assert
        const glyphs = curvedLabel.children
        const middleRadius = ((wedge.shape.r0 as number) + (wedge.shape.r as number)) / 2
        expect(curvedLabel).toMatchObject({ type: "group", x: 0, y: 0, rotation: 0 })
        expect(glyphs.map(glyph => glyph.style.text).join("")).toBe("wide.ts")
        for (const glyph of glyphs) {
            expect(Math.hypot(glyph.x - (wedge.shape.cx as number), glyph.y - (wedge.shape.cy as number))).toBeCloseTo(middleRadius)
        }
    })

    it("should keep a name that runs along the radius straight", () => {
        // Arrange
        const files = Array.from({ length: 16 }, (_, index) => fileNode(`/root/f${index}.ts`, { area: 1 }))

        // Act
        const { drawItem } = drawn(folderNode("/root", files, { area: 16 }))
        const [, label] = drawItem("/root/f0.ts").children

        // Assert
        expect(label).toMatchObject({ type: "text", style: { text: "f0.ts", overflow: "truncate" } })
    })

    it("should fade the hover gently, however many pieces the map has", () => {
        // Arrange
        const manyFiles = Array.from({ length: 2500 }, (_, index) => fileNode(`/root/f${index}.ts`))

        // Act
        const { series } = drawn(folderNode("/root", manyFiles))

        // Assert
        expect(series.stateAnimation.duration).toBeGreaterThanOrEqual(500)
        expect(series.animationThreshold).toBe(Number.POSITIVE_INFINITY)
        expect(series.animationDurationUpdate).toBe(0)
    })

    it("should draw a hovered piece on the map itself, however many pieces the map has", () => {
        // Act
        const { option } = drawn(TREE)

        // Assert
        expect(option.hoverLayerThreshold).toBe(Number.POSITIVE_INFINITY)
    })

    it("should draw one level deeper than it has bands, as the last band shows its folders' contents", () => {
        // Arrange
        const bandLimit = 6

        // Act
        const { visibleDepth } = radialTreemapShape(bandLimit)

        // Assert
        expect(visibleDepth).toBe(bandLimit + 1)
    })
})
