import { fileNode, folderNode, TEST_COLORING } from "../testing/radialChart.stub"
import { RadialPieceDatum } from "./radialPiecesOption"
import { RadialOptionInputs } from "./radialShape"
import { RadialNode } from "./radialTree"
import { buildSunburstOption, sunburstShape } from "./sunburstOption.builder"

const CHART_SIZE = { getWidth: () => 800, getHeight: () => 600 }

interface DrawnElement {
    type: string
    x?: number
    y?: number
    shape?: Record<string, number>
    style: Record<string, unknown>
    children?: DrawnElement[]
}

interface DrawnGroup {
    focus: string | number[]
    children: DrawnElement[]
}

function inputs(centre: RadialNode): RadialOptionInputs {
    return { centre, isMapRoot: false, metrics: { areaMetric: "rloc", colorMetric: "mcc" }, coloring: TEST_COLORING }
}

function drawn(centre: RadialNode) {
    const [series] = buildSunburstOption(inputs(centre), 3).series
    const data = series.data as RadialPieceDatum[]
    const drawItem = (path: string) => {
        const dataIndex = data.findIndex(datum => datum.name === path)
        return series.renderItem({ dataIndex }, CHART_SIZE) as DrawnGroup
    }
    return { series, data, drawItem }
}

const TREE = folderNode("/root", [folderNode("/root/src", [fileNode("/root/src/a.ts", { area: 30 })], { area: 30 })], { area: 30 })

describe("buildSunburstOption", () => {
    it("should draw every node as a custom series item named by its path, the centre first", () => {
        // Act
        const { series, data } = drawn(TREE)

        // Assert
        expect(series.type).toBe("custom")
        expect(data.map(datum => datum.name)).toEqual(["/root", "/root/src", "/root/src/a.ts"])
        expect(data[0].isCentre).toBe(true)
    })

    it("should let a hover reach as deep as its rings", () => {
        // Act
        const { visibleDepth } = sunburstShape(7)

        // Assert
        expect(visibleDepth).toBe(7)
    })

    it("should keep the hovered segment and the segments on its way to the centre lit", () => {
        // Act
        const { drawItem } = drawn(TREE)

        // Assert
        expect(drawItem("/root/src/a.ts").focus).toEqual([2, 1, 0])
        expect(drawItem("/root").focus).toEqual([0])
    })

    it("should curve a name along a wide segment, letter by letter on the ring's middle", () => {
        // Arrange
        const wideFile = fileNode("/root/wide.ts", { area: 90 })
        const centre = folderNode("/root", [wideFile, fileNode("/root/b.ts", { area: 10 })], { area: 100 })

        // Act
        const [segment, curvedLabel] = drawn(centre).drawItem(wideFile.path).children

        // Assert
        const middleRadius = (segment.shape.r0 + segment.shape.r) / 2
        expect(curvedLabel.children.map(glyph => glyph.style.text).join("")).toBe("wide.ts")
        for (const glyph of curvedLabel.children) {
            expect(Math.hypot(glyph.x - segment.shape.cx, glyph.y - segment.shape.cy)).toBeCloseTo(middleRadius)
        }
    })

    it("should keep a white border on a segment wide enough for it, and a thin one in its own colour", () => {
        // Arrange
        const centre = folderNode("/root", [fileNode("/root/huge.ts", { area: 1000 }), fileNode("/root/tiny.ts", { area: 0.001 })], {
            area: 1000.001
        })
        const { drawItem } = drawn(centre)

        // Act
        const [huge] = drawItem("/root/huge.ts").children
        const [tiny] = drawItem("/root/tiny.ts").children

        // Assert
        expect(huge.style).toMatchObject({ stroke: "#ffffff", lineWidth: 1 })
        expect(tiny.style.stroke).toBe(tiny.style.fill)
    })
})
