import { AttributeTypeValue, ColorMode, LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { defaultMapState } from "../../../mapState/mapState.read.facade"
import { defaultMetricsLensSource } from "../../../metricsLensSource/metricsLensSource.read.facade"
import { defaultPreferences } from "../../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"
import {
    migrateCcStateRecordToV3,
    migrateCcStateRecordToV4,
    migrateCcStateRecordToV5,
    migrateCcStateRecordToV6,
    migrateCcStateRecordToV7,
    migrateCcStateRecordToV8,
    migrateCcStateRecordToV9
} from "./rehomeKeysMigrations"

describe("migrateCcStateRecordToV3 (Slice 5 re-home transform)", () => {
    it("should move the map-view keys from appSettings into a new mapState root", () => {
        const oldShapeState = {
            appSettings: {
                ...defaultPreferences,
                invertHeight: true,
                amountOfTopLabels: 7,
                mapColors: { ...defaultMapState.mapColors, positive: "#123456" }
            }
        }

        const migrated = migrateCcStateRecordToV3(oldShapeState) as unknown as {
            appSettings: Record<string, unknown>
            mapState: Record<string, unknown>
        }

        expect(migrated.mapState.invertHeight).toBe(true)
        expect(migrated.mapState.amountOfTopLabels).toBe(7)
        expect((migrated.mapState.mapColors as { positive: string }).positive).toBe("#123456")
    })

    it("should keep the settings that stay under appSettings and drop the moved ones", () => {
        const oldShapeState = { appSettings: { ...defaultPreferences, invertHeight: true, amountOfTopLabels: 7 } }

        const migrated = migrateCcStateRecordToV3(oldShapeState) as { appSettings: Record<string, unknown> }

        expect(migrated.appSettings.maxTreeMapFiles).toBe(defaultPreferences.maxTreeMapFiles)
        expect("invertHeight" in migrated.appSettings).toBe(false)
        expect("amountOfTopLabels" in migrated.appSettings).toBe(false)
    })

    it("should fill map-view keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV3({ appSettings: { ...defaultPreferences } }) as unknown as {
            mapState: Record<string, unknown>
        }

        expect(migrated.mapState.labelSize).toBe(defaultMapState.labelSize)
        expect(migrated.mapState.scaling).toEqual(defaultMapState.scaling)
    })

    it("should return the record untouched when it has no appSettings", () => {
        expect(migrateCcStateRecordToV3(null)).toBeNull()
        expect(migrateCcStateRecordToV3({ files: [] })).toEqual({ files: [] })
    })
})

describe("migrateCcStateRecordToV4 (Slice 6 re-home transform)", () => {
    const v3ShapeState = () => ({
        dynamicSettings: { areaMetric: "rloc", colorMode: ColorMode.absolute, colorRange: { from: 3, to: 9 }, margin: 42 },
        appSettings: { maxTreeMapFiles: 100, layoutAlgorithm: LayoutAlgorithm.StreetMap, isLoadingMap: true },
        appStatus: { currentFilesAreSampleFiles: true, hoveredNodeId: 5, selectedBuildingId: 9, rightClickedNodeData: null }
    })

    it("should move the stragglers from dynamicSettings, appSettings and appStatus into mapState", () => {
        const migrated = migrateCcStateRecordToV4(v3ShapeState()) as unknown as { mapState: Record<string, unknown> }

        expect(migrated.mapState.colorMode).toBe(ColorMode.absolute)
        expect(migrated.mapState.colorRange).toEqual({ from: 3, to: 9 })
        expect(migrated.mapState.margin).toBe(42)
        expect(migrated.mapState.layoutAlgorithm).toBe(LayoutAlgorithm.StreetMap)
        expect(migrated.mapState.isLoadingMap).toBe(true)
        expect(migrated.mapState.hoveredNodeId).toBe(5)
        expect(migrated.mapState.selectedBuildingId).toBe(9)
        expect(migrated.mapState.rightClickedNodeData).toBeNull()
    })

    it("should drop the moved keys from their source homes and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV4(v3ShapeState()) as unknown as {
            dynamicSettings: Record<string, unknown>
            appSettings: Record<string, unknown>
            appStatus: Record<string, unknown>
        }

        expect(migrated.dynamicSettings.areaMetric).toBe("rloc")
        expect("colorMode" in migrated.dynamicSettings).toBe(false)
        expect("margin" in migrated.dynamicSettings).toBe(false)
        expect(migrated.appSettings.maxTreeMapFiles).toBe(100)
        expect("layoutAlgorithm" in migrated.appSettings).toBe(false)
        expect("isLoadingMap" in migrated.appSettings).toBe(false)
        expect(migrated.appStatus.currentFilesAreSampleFiles).toBe(true)
        expect("hoveredNodeId" in migrated.appStatus).toBe(false)
        expect("selectedBuildingId" in migrated.appStatus).toBe(false)
    })

    it("should fill mapState keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV4({ dynamicSettings: {}, appSettings: {}, appStatus: {} }) as unknown as {
            mapState: Record<string, unknown>
        }

        expect(migrated.mapState.colorMode).toBe(defaultMapState.colorMode)
        expect(migrated.mapState.layoutAlgorithm).toBe(defaultMapState.layoutAlgorithm)
        expect(migrated.mapState.scaling).toEqual(defaultMapState.scaling)
    })

    it("should return the record untouched when it is null or has no source homes", () => {
        expect(migrateCcStateRecordToV4(null)).toBeNull()
        const migrated = migrateCcStateRecordToV4({ files: [] }) as unknown as { files: unknown[]; mapState: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.mapState.colorMode).toBe(defaultMapState.colorMode)
    })
})

describe("migrateCcStateRecordToV5 (Slice 7 re-home transform)", () => {
    const v4ShapeState = () => ({
        dynamicSettings: {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "cov",
            edgeMetric: "pairingRate",
            distributionMetric: "rloc",
            sortingOption: "NAME",
            focusedNodePath: [],
            searchPattern: ""
        }
    })

    it("should move the five metric-selection keys from dynamicSettings into mapState", () => {
        const migrated = migrateCcStateRecordToV5(v4ShapeState()) as unknown as { mapState: Record<string, unknown> }

        expect(migrated.mapState.areaMetric).toBe("rloc")
        expect(migrated.mapState.heightMetric).toBe("mcc")
        expect(migrated.mapState.colorMetric).toBe("cov")
        expect(migrated.mapState.edgeMetric).toBe("pairingRate")
        expect(migrated.mapState.distributionMetric).toBe("rloc")
    })

    it("should drop the moved metrics from dynamicSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV5(v4ShapeState()) as unknown as { dynamicSettings: Record<string, unknown> }

        expect("areaMetric" in migrated.dynamicSettings).toBe(false)
        expect("distributionMetric" in migrated.dynamicSettings).toBe(false)
        expect(migrated.dynamicSettings.sortingOption).toBe("NAME")
        expect(migrated.dynamicSettings.searchPattern).toBe("")
        expect(migrated.dynamicSettings.focusedNodePath).toEqual([])
    })

    it("should fill mapState metric keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV5({ dynamicSettings: {} }) as unknown as { mapState: Record<string, unknown> }

        expect(migrated.mapState.areaMetric).toBe(defaultMapState.areaMetric)
        expect(migrated.mapState.colorMetric).toBe(defaultMapState.colorMetric)
    })

    it("should return the record untouched when it is null or has no dynamicSettings", () => {
        expect(migrateCcStateRecordToV5(null)).toBeNull()
        const migrated = migrateCcStateRecordToV5({ files: [] }) as unknown as { files: unknown[]; mapState: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.mapState.areaMetric).toBe(defaultMapState.areaMetric)
    })
})

describe("migrateCcStateRecordToV6 (Slice 8 re-home transform)", () => {
    const v5ShapeState = () => ({
        dynamicSettings: {
            sortingOption: "NAME",
            focusedNodePath: ["/root/ParentLeaf"],
            searchPattern: "needle"
        }
    })

    it("should move focusedNodePath + searchPattern from dynamicSettings into a brand-new sharedView root", () => {
        const migrated = migrateCcStateRecordToV6(v5ShapeState()) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should drop the moved keys from dynamicSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV6(v5ShapeState()) as unknown as { dynamicSettings: Record<string, unknown> }

        expect("focusedNodePath" in migrated.dynamicSettings).toBe(false)
        expect("searchPattern" in migrated.dynamicSettings).toBe(false)
        expect(migrated.dynamicSettings.sortingOption).toBe("NAME")
    })

    it("should fill sharedView keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV6({ dynamicSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.focusedNodePath).toEqual(defaultSharedView.focusedNodePath)
        expect(migrated.sharedView.searchPattern).toBe(defaultSharedView.searchPattern)
    })

    it("should return the record untouched when it is null, and build a default sharedView when there is no dynamicSettings", () => {
        expect(migrateCcStateRecordToV6(null)).toBeNull()
        const migrated = migrateCcStateRecordToV6({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.focusedNodePath).toEqual(defaultSharedView.focusedNodePath)
    })
})

describe("migrateCcStateRecordToV7 (Slice 9a re-home transform)", () => {
    const v6ShapeState = () => ({
        fileSettings: {
            blacklist: [],
            edges: [],
            markedPackages: [],
            attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: {} },
            attributeDescriptors: { rloc: { title: "Lines of Code" } }
        }
    })

    it("should move attributeTypes + attributeDescriptors from fileSettings into a brand-new metricsLensSource root", () => {
        const migrated = migrateCcStateRecordToV7(v6ShapeState()) as unknown as { metricsLensSource: Record<string, unknown> }

        expect(migrated.metricsLensSource.attributeTypes).toEqual({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} })
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
    })

    it("should drop the moved keys from fileSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV7(v6ShapeState()) as unknown as { fileSettings: Record<string, unknown> }

        expect("attributeTypes" in migrated.fileSettings).toBe(false)
        expect("attributeDescriptors" in migrated.fileSettings).toBe(false)
        expect(migrated.fileSettings.blacklist).toEqual([])
        expect(migrated.fileSettings.edges).toEqual([])
        expect(migrated.fileSettings.markedPackages).toEqual([])
    })

    it("should fill metricsLensSource keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV7({ fileSettings: {} }) as unknown as { metricsLensSource: Record<string, unknown> }

        expect(migrated.metricsLensSource.attributeTypes).toEqual(defaultMetricsLensSource.attributeTypes)
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual(defaultMetricsLensSource.attributeDescriptors)
    })

    it("should return the record untouched when it is null, and build a default metricsLensSource when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV7(null)).toBeNull()
        const migrated = migrateCcStateRecordToV7({ files: [] }) as unknown as {
            files: unknown[]
            metricsLensSource: Record<string, unknown>
        }
        expect(migrated.files).toEqual([])
        expect(migrated.metricsLensSource.attributeTypes).toEqual(defaultMetricsLensSource.attributeTypes)
    })
})

describe("migrateCcStateRecordToV8 (Slice 9b re-home transform)", () => {
    const v7ShapeState = () => ({
        fileSettings: {
            blacklist: [{ path: "/root/excluded", type: "exclude" }],
            edges: [],
            markedPackages: []
        },
        sharedView: {
            focusedNodePath: ["/root/ParentLeaf"],
            searchPattern: "needle"
        }
    })

    it("should move blacklist from fileSettings into the EXISTING sharedView root, preserving its other keys", () => {
        const migrated = migrateCcStateRecordToV8(v7ShapeState()) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.blacklist).toEqual([{ path: "/root/excluded", type: "exclude" }])
        expect(migrated.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should drop blacklist from fileSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV8(v7ShapeState()) as unknown as { fileSettings: Record<string, unknown> }

        expect("blacklist" in migrated.fileSettings).toBe(false)
        expect(migrated.fileSettings.edges).toEqual([])
        expect(migrated.fileSettings.markedPackages).toEqual([])
    })

    it("should fill the sharedView rule lists with their defaults when absent from the old blob", () => {
        const migrated = migrateCcStateRecordToV8({ fileSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        // the v8 shape seeds the sharedView from the defaults, which now hold the two split lists
        expect(migrated.sharedView.blacklist).toBeUndefined()
        expect(migrated.sharedView.excludedNodes).toEqual([])
        expect(migrated.sharedView.flattenedNodes).toEqual([])
    })

    it("should return the record untouched when it is null, and build a default sharedView when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV8(null)).toBeNull()
        const migrated = migrateCcStateRecordToV8({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.excludedNodes).toEqual([])
    })
})

describe("migrateCcStateRecordToV9 (Slice 9c re-home transform)", () => {
    const v8ShapeState = () => ({
        fileSettings: {
            edges: [],
            markedPackages: [{ path: "/root/src", color: "#FF0000" }]
        },
        sharedView: {
            focusedNodePath: ["/root/ParentLeaf"],
            searchPattern: "needle",
            blacklist: [{ path: "/root/excluded", type: "exclude" }]
        }
    })

    it("should move markedPackages from fileSettings into the EXISTING sharedView root, preserving its other keys", () => {
        const migrated = migrateCcStateRecordToV9(v8ShapeState()) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.markedPackages).toEqual([{ path: "/root/src", color: "#FF0000" }])
        expect(migrated.sharedView.blacklist).toEqual([{ path: "/root/excluded", type: "exclude" }])
        expect(migrated.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should drop markedPackages from fileSettings and keep the staying ones", () => {
        const migrated = migrateCcStateRecordToV9(v8ShapeState()) as unknown as { fileSettings: Record<string, unknown> }

        expect("markedPackages" in migrated.fileSettings).toBe(false)
        expect(migrated.fileSettings.edges).toEqual([])
    })

    it("should fill sharedView markedPackages with its default when absent from the old blob", () => {
        const migrated = migrateCcStateRecordToV9({ fileSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.markedPackages).toEqual(defaultSharedView.markedPackages)
    })

    it("should return the record untouched when it is null, and build a default sharedView markedPackages when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV9(null)).toBeNull()
        const migrated = migrateCcStateRecordToV9({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.markedPackages).toEqual(defaultSharedView.markedPackages)
    })
})
