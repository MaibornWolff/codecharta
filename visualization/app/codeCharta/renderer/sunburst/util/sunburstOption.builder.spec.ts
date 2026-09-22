import { ColorMode } from "../../../model/codeCharta.model"
import { defaultMapColors } from "../../../stores/mapState/store/mapColors/mapColors.reducer"
import { SunburstColoring } from "./sunburstColor"
import { SunburstFolder } from "./sunburstFolders"
import { buildSunburstOption, SunburstOptionInputs, VISIBLE_RING_COUNT } from "./sunburstOption.builder"

const COLORING: SunburstColoring = {
    colorMetric: "mcc",
    colorRange: { from: 10, to: 20 },
    colorMode: ColorMode.absolute,
    mapColors: defaultMapColors,
    colorMetricRange: { minValue: 0, maxValue: 100 }
}

function folder(path: string, children: SunburstFolder[] = [], overrides: Partial<SunburstFolder> = {}): SunburstFolder {
    return { path, name: path.split("/").at(-1), area: 10, colorValue: 5, isFlat: false, children, ...overrides }
}

function inputs(centre: SunburstFolder, overrides: Partial<SunburstOptionInputs> = {}): SunburstOptionInputs {
    return {
        centre,
        isMapRoot: false,
        metrics: { areaMetric: "rloc", colorMetric: "mcc" },
        coloring: COLORING,
        folderColorValueRange: { minValue: 0, maxValue: 100 },
        chartSizeInPixels: 800,
        ...overrides
    }
}

function nestedFolders(depth: number, path = "/root"): SunburstFolder {
    return folder(path, depth > 0 ? [nestedFolders(depth - 1, `${path}/level${depth}`)] : [])
}

function depthOf(datum: { children: unknown[] }): number {
    const [child] = datum.children as { children: unknown[] }[]
    return child ? 1 + depthOf(child) : 0
}

describe("buildSunburstOption", () => {
    it("should put the centre folder in the middle, keyed by its path and labelled by its name", () => {
        // Act
        const option = buildSunburstOption(inputs(folder("/root/src", [], { area: 42 })))

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

    it("should still draw one ring for a folder without sub folders", () => {
        // Act
        const option = buildSunburstOption(inputs(folder("/root")))

        // Assert
        expect(option.series[0].levels).toHaveLength(1 + 1 + 1)
    })

    it("should leave drilling to the caller instead of letting ECharts zoom", () => {
        // Act
        const option = buildSunburstOption(inputs(folder("/root")))

        // Assert
        expect(option.series[0].nodeClick).toBe(false)
    })

    it("should colour each segment by the folder's value and pick a readable label colour", () => {
        // Act
        const option = buildSunburstOption(inputs(folder("/root", [folder("/root/hot", [], { colorValue: 50 })])))

        // Assert
        const [hot] = option.series[0].data[0].children
        expect(hot.itemStyle.color).toBe(defaultMapColors.negative)
        expect(hot.label.color).toBe("#ffffff")
    })

    it("should label a segment with the folder name", () => {
        // Arrange
        const option = buildSunburstOption(inputs(folder("/root/src")))

        // Act
        const label = option.series[0].label.formatter({ data: option.series[0].data[0] })

        // Assert
        expect(label).toBe("src")
    })

    it("should list the path, area and colour value in the tooltip, escaped", () => {
        // Arrange
        const option = buildSunburstOption(inputs(folder("/root", [folder("/root/<b>", [], { area: 1234.567, colorValue: undefined })])))
        const [child] = option.series[0].data[0].children

        // Act
        const tooltip = option.tooltip.formatter({ data: child })

        // Assert
        expect(tooltip).toContain("/root/&lt;b&gt;")
        expect(tooltip).toContain("rloc: 1,234.57")
        expect(tooltip).toContain("mcc: –")
        expect(tooltip).not.toContain("go up")
    })

    it("should tell in the tooltip that clicking the centre goes up, unless it is the top of the map", () => {
        // Arrange
        const nested = buildSunburstOption(inputs(folder("/root/src")))
        const top = buildSunburstOption(inputs(folder("/root"), { isMapRoot: true }))

        // Act
        const nestedTooltip = nested.tooltip.formatter({ data: nested.series[0].data[0] })
        const topTooltip = top.tooltip.formatter({ data: top.series[0].data[0] })

        // Assert
        expect(nestedTooltip).toContain("Click to go up one folder")
        expect(topTooltip).not.toContain("go up")
    })

    it("should show nothing for a tooltip without data", () => {
        // Act
        const option = buildSunburstOption(inputs(folder("/root")))

        // Assert
        expect(option.tooltip.formatter({})).toBe("")
        expect(option.series[0].label.formatter({})).toBe("")
    })
})
