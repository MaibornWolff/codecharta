import { RadialFolderValue } from "../../../model/codeCharta.model"
import { defaultMapColors } from "../../../stores/mapState/mapState.read.facade"
import { fileNode, folderNode, TEST_COLORING } from "../testing/radialChart.stub"
import { RadialOptionInputs } from "./radialShape"
import { RadialNode } from "./radialTree"
import { buildSunburstOption, VISIBLE_RING_COUNT } from "./sunburstOption.builder"

function inputs(centre: RadialNode, overrides: Partial<RadialOptionInputs> = {}): RadialOptionInputs {
    return {
        centre,
        isMapRoot: false,
        metrics: { areaMetric: "rloc", colorMetric: "mcc" },
        coloring: TEST_COLORING,
        chartSizeInPixels: 800,
        ...overrides
    }
}

function nestedFolders(depth: number, path = "/root"): RadialNode {
    return folderNode(path, depth > 0 ? [nestedFolders(depth - 1, `${path}/level${depth}`)] : [])
}

function depthOf(datum: { children: unknown[] }): number {
    const [child] = datum.children as { children: unknown[] }[]
    return child ? 1 + depthOf(child) : 0
}

describe("buildSunburstOption", () => {
    it("should put the centre folder in the middle, keyed by its path and labelled by its name", () => {
        // Act
        const option = buildSunburstOption(inputs(folderNode("/root/src", [], { area: 42 })))

        // Assert
        const [centre] = option.series[0].data
        expect(centre.name).toBe("/root/src")
        expect(centre.displayName).toBe("src")
        expect(centre.value).toBe(42)
        expect(centre.isCentre).toBe(true)
    })

    it("should show at most three rings around the centre", () => {
        // Act
        const option = buildSunburstOption(inputs(nestedFolders(6)))

        // Assert
        expect(depthOf(option.series[0].data[0])).toBe(VISIBLE_RING_COUNT)
        expect(option.series[0].levels).toHaveLength(1 + 1 + VISIBLE_RING_COUNT)
    })

    it("should widen the rings to fill the chart when the centre has fewer levels below it", () => {
        // Act
        const option = buildSunburstOption(inputs(nestedFolders(1)))

        // Assert
        const levels = option.series[0].levels
        expect(levels).toHaveLength(1 + 1 + 1)
        expect(levels[2]).toEqual(expect.objectContaining({ r0: "20%", r: "95%" }))
    })

    it("should count the rings of a folder with a very large number of children", () => {
        // Arrange
        const children = Array.from({ length: 200_000 }, (_, index) => folderNode(`/root/file${index}`))

        // Act
        const option = buildSunburstOption(inputs(folderNode("/root", children)))

        // Assert
        expect(option.series[0].levels).toHaveLength(1 + 1 + 1)
    })

    it("should still draw one ring for a folder without sub folders", () => {
        // Act
        const option = buildSunburstOption(inputs(folderNode("/root")))

        // Assert
        expect(option.series[0].levels).toHaveLength(1 + 1 + 1)
    })

    it("should tell files from folders so a click on a file does not drill", () => {
        // Act
        const option = buildSunburstOption(inputs(folderNode("/root", [folderNode("/root/a.ts", [], { isFile: true })])))

        // Assert
        const [fileDatum] = option.series[0].data[0].children
        expect(fileDatum.isFile).toBe(true)
        expect(option.series[0].data[0].isFile).toBe(false)
    })

    it("should write file names in bold and leave folder names to the ring's style", () => {
        // Act
        const option = buildSunburstOption(
            inputs(folderNode("/root", [folderNode("/root/a.ts", [], { isFile: true }), folderNode("/root/src")]))
        )

        // Assert
        const [fileDatum, folderDatum] = option.series[0].data[0].children
        expect(fileDatum.label.fontWeight).toBe("bold")
        expect(folderDatum.label.fontWeight).toBeUndefined()
    })

    it("should fade the hover in and out gently and only dim the rest of the chart", () => {
        // Act
        const [series] = buildSunburstOption(inputs(folderNode("/root"))).series

        // Assert
        expect(series.stateAnimation.duration).toBeGreaterThanOrEqual(500)
        expect(series.blur.itemStyle.opacity).toBeGreaterThan(0.2)
    })

    it("should leave drilling to the caller instead of letting ECharts zoom", () => {
        // Act
        const option = buildSunburstOption(inputs(folderNode("/root")))

        // Assert
        expect(option.series[0].nodeClick).toBe(false)
    })

    it("should colour each segment by the folder's value and pick a readable label colour", () => {
        // Arrange
        const folders = { ...TEST_COLORING.folders, values: new Map([["/root/hot", 50]]), tint: 1 }
        const coloring = { ...TEST_COLORING, folders }

        // Act
        const option = buildSunburstOption(inputs(folderNode("/root", [folderNode("/root/hot")]), { coloring }))

        // Assert
        const [hot] = option.series[0].data[0].children
        expect(hot.itemStyle.color).toBe(defaultMapColors.negative.toLowerCase())
        expect(hot.label.color).toBe("#ffffff")
    })

    it("should label a segment with the folder name", () => {
        // Arrange
        const option = buildSunburstOption(inputs(folderNode("/root/src")))

        // Act
        const label = option.series[0].label.formatter({ data: option.series[0].data[0] })

        // Assert
        expect(label).toBe("src")
    })

    it("should list the path, area and colour value in the tooltip, escaped", () => {
        // Arrange
        const option = buildSunburstOption(
            inputs(folderNode("/root", [folderNode("/root/<b>", [], { area: 1234.567, colorValue: undefined })]))
        )
        const [child] = option.series[0].data[0].children

        // Act
        const tooltip = option.tooltip.formatter({ data: child })

        // Assert
        expect(tooltip).toContain("/root/&lt;b&gt;")
        expect(tooltip).toContain("rloc: 1,234.57")
        expect(tooltip).toContain("mcc: –")
        expect(tooltip).not.toContain("go up")
    })

    it("should show a folder's value in its tooltip", () => {
        // Arrange
        const values = new Map([["/root/src", 47]])
        const coloring = { ...TEST_COLORING, folders: { ...TEST_COLORING.folders, values, value: RadialFolderValue.Min } }
        const option = buildSunburstOption(inputs(folderNode("/root", [folderNode("/root/src")]), { coloring }))

        // Act
        const tooltip = option.tooltip.formatter({ data: option.series[0].data[0].children[0] })

        // Assert
        expect(tooltip).toContain("min 47")
    })

    it("should show no folder value in a file's tooltip", () => {
        // Arrange
        const coloring = { ...TEST_COLORING, folders: { ...TEST_COLORING.folders, values: new Map([["/root/a.ts", 3]]) } }
        const option = buildSunburstOption(inputs(folderNode("/root", [fileNode("/root/a.ts")]), { coloring }))

        // Act
        const tooltip = option.tooltip.formatter({ data: option.series[0].data[0].children[0] })

        // Assert
        expect(tooltip).not.toContain("max")
    })

    it("should tell in the tooltip that clicking the centre goes up, unless it is the top of the map", () => {
        // Arrange
        const nested = buildSunburstOption(inputs(folderNode("/root/src")))
        const top = buildSunburstOption(inputs(folderNode("/root"), { isMapRoot: true }))

        // Act
        const nestedTooltip = nested.tooltip.formatter({ data: nested.series[0].data[0] })
        const topTooltip = top.tooltip.formatter({ data: top.series[0].data[0] })

        // Assert
        expect(nestedTooltip).toContain("Click to go up one folder")
        expect(topTooltip).not.toContain("go up")
    })

    it("should show nothing for a tooltip without data", () => {
        // Act
        const option = buildSunburstOption(inputs(folderNode("/root")))

        // Assert
        expect(option.tooltip.formatter({})).toBe("")
        expect(option.series[0].label.formatter({})).toBe("")
    })

    it("should outline a segment too thin for a white border in its own colour, so tiny files do not fade to white", () => {
        // Arrange
        const centre = folderNode("/root", [fileNode("/root/huge.ts", { area: 1000 }), fileNode("/root/tiny.ts", { area: 0.001 })], {
            area: 1000.001
        })

        // Act
        const [huge, tiny] = buildSunburstOption(inputs(centre)).series[0].data[0].children

        // Assert
        expect(huge.itemStyle).toMatchObject({ borderColor: "#ffffff", borderWidth: 1 })
        expect(tiny.itemStyle.borderColor).toBe(tiny.itemStyle.color)
    })
})
