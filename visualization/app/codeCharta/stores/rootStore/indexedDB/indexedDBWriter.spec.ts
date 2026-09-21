import "fake-indexeddb/auto"
import { IDBFactory } from "fake-indexeddb"
import { openDB } from "idb"
import { AttributeTypeValue, ColorMode, LayoutAlgorithm } from "../../../model/codeCharta.model"
import { isPendingSave$ } from "../../../util/busy/isPendingSave"
import { defaultDependencyLensSource } from "../../dependencyLensSource/dependencyLensSource.read.facade"
import { defaultMapState } from "../../mapState/mapState.read.facade"
import { defaultMetricsLensSource } from "../../metricsLensSource/metricsLensSource.read.facade"
import { defaultPreferences } from "../../preferences/preferences.read.facade"
import { defaultSharedView } from "../../sharedView/sharedView.read.facade"
import { defaultState } from "../state.manager"
import {
    CCSTATE_PRIMARY_KEY,
    CCSTATE_STATE_ID,
    CCSTATE_STORE_NAME,
    DB_NAME,
    DB_VERSION,
    deleteCcState,
    migrateCcStateRecordToV3,
    migrateCcStateRecordToV4,
    migrateCcStateRecordToV5,
    migrateCcStateRecordToV6,
    migrateCcStateRecordToV7,
    migrateCcStateRecordToV8,
    migrateCcStateRecordToV9,
    migrateCcStateRecordToV10,
    migrateCcStateRecordToV11,
    migrateCcStateRecordToV12,
    migrateCcStateRecordToV13,
    migrateCcStateRecordToV14,
    migrateCcStateRecordToV15,
    migrateCcStateRecordToV16,
    migrateCcStateRecordToV17,
    migrateCcStateRecordToV18,
    migrateCcStateRecordToV19,
    migrateCcStateRecordToV20,
    migrateCcStateRecordToV21,
    migrateCcStateRecordToV22,
    openCodeChartaDB,
    readCcState,
    SCENARIOS_STORE_NAME,
    writeCcFiles,
    writeCcState
} from "./indexedDBWriter"

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

describe("migrateCcStateRecordToV10 (Slice 10a re-home transform)", () => {
    const v9ShapeState = () => ({
        appSettings: { maxTreeMapFiles: 100, isLoadingFile: false },
        appStatus: { currentFilesAreSampleFiles: true }
    })

    it("should promote isLoadingFile + currentFilesAreSampleFiles to their own top-level roots", () => {
        const migrated = migrateCcStateRecordToV10(v9ShapeState()) as unknown as {
            isLoadingFile: boolean
            currentFilesAreSampleFiles: boolean
        }

        expect(migrated.isLoadingFile).toBe(false)
        expect(migrated.currentFilesAreSampleFiles).toBe(true)
    })

    it("should drop isLoadingFile from appSettings and delete the now-empty appStatus grab-bag", () => {
        const migrated = migrateCcStateRecordToV10(v9ShapeState()) as unknown as {
            appSettings: Record<string, unknown>
            appStatus?: Record<string, unknown>
        }

        expect("isLoadingFile" in migrated.appSettings).toBe(false)
        expect(migrated.appSettings.maxTreeMapFiles).toBe(100)
        expect(migrated.appStatus).toBeUndefined()
    })

    it("should return the record untouched when it is null, and just drop appStatus when the flags are absent", () => {
        expect(migrateCcStateRecordToV10(null)).toBeNull()
        const migrated = migrateCcStateRecordToV10({ files: [] }) as unknown as { files: unknown[] }
        expect(migrated.files).toEqual([])
        expect("appStatus" in (migrated as object)).toBe(false)
    })
})

describe("migrateCcStateRecordToV11 (Slice 10b re-home transform)", () => {
    const v10ShapeState = () => ({
        appSettings: {
            isPresentationMode: true,
            resetCameraIfNewFileIsLoaded: false,
            sortingOrderAscending: false,
            maxTreeMapFiles: 42,
            experimentalFeaturesEnabled: true,
            screenshotToClipboardEnabled: true,
            isColorMetricLinkedToHeightMetric: true
        },
        dynamicSettings: { sortingOption: "NUMBER_OF_FILES" }
    })

    it("should move the seven appSettings prefs + dynamicSettings.sortingOption into a brand-new preferences root", () => {
        const migrated = migrateCcStateRecordToV11(v10ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect(migrated.preferences.isPresentationMode).toBe(true)
        expect(migrated.preferences.maxTreeMapFiles).toBe(42)
        expect(migrated.preferences.experimentalFeaturesEnabled).toBe(true)
        expect(migrated.preferences.isColorMetricLinkedToHeightMetric).toBe(true)
        expect(migrated.preferences.sortingOption).toBe("NUMBER_OF_FILES")
    })

    it("should delete both the appSettings and dynamicSettings grab-bags", () => {
        const migrated = migrateCcStateRecordToV11(v10ShapeState()) as unknown as {
            appSettings?: Record<string, unknown>
            dynamicSettings?: Record<string, unknown>
        }

        expect(migrated.appSettings).toBeUndefined()
        expect(migrated.dynamicSettings).toBeUndefined()
    })

    it("should fill preferences keys absent from the old blob with their defaults", () => {
        const migrated = migrateCcStateRecordToV11({ appSettings: {}, dynamicSettings: {} }) as unknown as {
            preferences: Record<string, unknown>
        }

        expect(migrated.preferences.maxTreeMapFiles).toBe(defaultPreferences.maxTreeMapFiles)
        // sortingOption's default is no longer a top-level preference key (merged into `sorting` at v12);
        // v11 now carries the default `sorting` object through its defaultPreferences base spread.
        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })

    it("should return the record untouched when it is null, and build a default preferences when there are no grab-bags", () => {
        expect(migrateCcStateRecordToV11(null)).toBeNull()
        const migrated = migrateCcStateRecordToV11({ files: [] }) as unknown as { files: unknown[]; preferences: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })
})

describe("migrateCcStateRecordToV12 (Slice 10c sort-merge transform)", () => {
    const v11ShapeState = () => ({
        preferences: {
            isPresentationMode: true,
            maxTreeMapFiles: 42,
            sortingOption: "NUMBER_OF_FILES",
            sortingOrderAscending: false
        }
    })

    it("should nest the two flat sort prefs into a single preferences.sorting object", () => {
        const migrated = migrateCcStateRecordToV12(v11ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect(migrated.preferences.sorting).toEqual({ option: "NUMBER_OF_FILES", orderAscending: false })
    })

    it("should delete the two flat sort pref keys and keep the other preferences", () => {
        const migrated = migrateCcStateRecordToV12(v11ShapeState()) as unknown as { preferences: Record<string, unknown> }

        expect("sortingOption" in migrated.preferences).toBe(false)
        expect("sortingOrderAscending" in migrated.preferences).toBe(false)
        expect(migrated.preferences.maxTreeMapFiles).toBe(42)
    })

    it("should fall back to the sorting defaults when the flat keys are absent", () => {
        const migrated = migrateCcStateRecordToV12({ preferences: { maxTreeMapFiles: 42 } }) as unknown as {
            preferences: Record<string, unknown>
        }

        expect(migrated.preferences.sorting).toEqual(defaultPreferences.sorting)
    })

    it("should return the record untouched when it is null or has no preferences", () => {
        expect(migrateCcStateRecordToV12(null)).toBeNull()
        const migrated = migrateCcStateRecordToV12({ files: [] }) as unknown as { files: unknown[]; preferences?: unknown }
        expect(migrated.files).toEqual([])
        expect(migrated.preferences).toBeUndefined()
    })
})

describe("migrateCcStateRecordToV13 (Slice 14 edge-attributeTypes split transform)", () => {
    const v12ShapeState = () => ({
        metricsLensSource: {
            attributeTypes: {
                nodes: { rloc: AttributeTypeValue.absolute },
                edges: { pairing_rate: AttributeTypeValue.relative }
            },
            attributeDescriptors: { rloc: { title: "Lines of Code" } }
        }
    })

    it("should move the edge attributeTypes out of metricsLensSource into a brand-new dependencyLensSource root", () => {
        const migrated = migrateCcStateRecordToV13(v12ShapeState()) as unknown as { dependencyLensSource: Record<string, unknown> }

        expect(migrated.dependencyLensSource.attributeTypes).toEqual({ nodes: {}, edges: { pairing_rate: AttributeTypeValue.relative } })
    })

    it("should keep the node attributeTypes + descriptors in metricsLensSource and empty its edges", () => {
        const migrated = migrateCcStateRecordToV13(v12ShapeState()) as unknown as { metricsLensSource: Record<string, unknown> }

        expect(migrated.metricsLensSource.attributeTypes).toEqual({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} })
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
    })

    it("should fill dependencyLensSource with its default when metricsLensSource is absent", () => {
        const migrated = migrateCcStateRecordToV13({ files: [] }) as unknown as {
            files: unknown[]
            dependencyLensSource: Record<string, unknown>
        }

        expect(migrated.files).toEqual([])
        expect(migrated.dependencyLensSource.attributeTypes).toEqual(defaultDependencyLensSource.attributeTypes)
    })

    it("should return the record untouched when it is null", () => {
        expect(migrateCcStateRecordToV13(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV14 (Slice 14e-1 re-home transform)", () => {
    it("should move the interaction ids out of mapState into sharedView, nulled", () => {
        const migrated = migrateCcStateRecordToV14({
            mapState: { hoveredNodeId: 7, selectedBuildingId: 3, rightClickedNodeData: { nodeId: 9 }, scaling: 1 },
            sharedView: { blacklist: [] }
        }) as unknown as { mapState: Record<string, unknown>; sharedView: Record<string, unknown> }

        expect(migrated.sharedView.hoveredNodeId).toBeNull()
        expect(migrated.sharedView.selectedBuildingId).toBeNull()
        expect(migrated.sharedView.rightClickedNodeData).toBeNull()
        expect("hoveredNodeId" in migrated.mapState).toBe(false)
        expect("selectedBuildingId" in migrated.mapState).toBe(false)
        expect("rightClickedNodeData" in migrated.mapState).toBe(false)
        expect(migrated.mapState.scaling).toBe(1)
        expect(migrated.sharedView.blacklist).toEqual([])
    })

    it("should return the record untouched when it is null", () => {
        expect(migrateCcStateRecordToV14(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV15 (Slice 15e fileSettings-drop transform)", () => {
    const v14ShapeState = () => ({
        fileSettings: { edges: [{ fromNodeName: "/root/a", toNodeName: "/root/b", attributes: {} }] },
        sharedView: { blacklist: [], hoveredNodeId: null, selectedBuildingId: null, rightClickedNodeData: null },
        mapState: { scaling: 1 }
    })

    it("should drop the whole fileSettings root now that edges is a derived dependency-lens selector", () => {
        // Arrange
        const oldShapeState = v14ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV15(oldShapeState) as unknown as { fileSettings?: Record<string, unknown> }

        // Assert
        expect(migrated.fileSettings).toBeUndefined()
    })

    it("should leave every other root untouched", () => {
        // Arrange
        const oldShapeState = v14ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV15(oldShapeState) as unknown as {
            sharedView: Record<string, unknown>
            mapState: Record<string, unknown>
        }

        // Assert
        expect(migrated.sharedView).toEqual({ blacklist: [], hoveredNodeId: null, selectedBuildingId: null, rightClickedNodeData: null })
        expect(migrated.mapState).toEqual({ scaling: 1 })
    })

    it("should return the record untouched when it is null or already has no fileSettings", () => {
        // Arrange / Act / Assert
        expect(migrateCcStateRecordToV15(null)).toBeNull()
        const migrated = migrateCcStateRecordToV15({ files: [] }) as unknown as { files: unknown[]; fileSettings?: unknown }
        expect(migrated.files).toEqual([])
        expect(migrated.fileSettings).toBeUndefined()
    })
})

describe("migrateCcStateRecordToV16 (Slice 20 attributeTypes-unwrap transform)", () => {
    const v15ShapeState = () => ({
        metricsLensSource: {
            attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: {} },
            attributeDescriptors: { rloc: { title: "Lines of Code" } }
        },
        dependencyLensSource: {
            attributeTypes: { nodes: {}, edges: { pairing_rate: AttributeTypeValue.relative } }
        },
        mapState: { scaling: 1 }
    })

    it("should unwrap the metrics lens source's attributeTypes to the node half it owns", () => {
        // Arrange
        const oldShapeState = v15ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as { metricsLensSource: Record<string, unknown> }

        // Assert
        expect(migrated.metricsLensSource.attributeTypes).toEqual({ rloc: AttributeTypeValue.absolute })
        expect(migrated.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
    })

    it("should unwrap the dependency lens source's attributeTypes to the edge half it owns", () => {
        // Arrange
        const oldShapeState = v15ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as { dependencyLensSource: Record<string, unknown> }

        // Assert
        expect(migrated.dependencyLensSource.attributeTypes).toEqual({ pairing_rate: AttributeTypeValue.relative })
    })

    it("should fall back to an empty map when the owned half is missing", () => {
        // Arrange
        const oldShapeState = {
            metricsLensSource: { attributeTypes: { edges: {} } },
            dependencyLensSource: { attributeTypes: { nodes: {} } }
        }

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as {
            metricsLensSource: Record<string, unknown>
            dependencyLensSource: Record<string, unknown>
        }

        // Assert
        expect(migrated.metricsLensSource.attributeTypes).toEqual({})
        expect(migrated.dependencyLensSource.attributeTypes).toEqual({})
    })

    it("should leave an already flat attributeTypes map untouched", () => {
        // Arrange
        const alreadyFlatState = {
            metricsLensSource: { attributeTypes: { rloc: AttributeTypeValue.absolute } },
            dependencyLensSource: { attributeTypes: { pairing_rate: AttributeTypeValue.relative } }
        }

        // Act
        const migrated = migrateCcStateRecordToV16(alreadyFlatState) as unknown as {
            metricsLensSource: Record<string, unknown>
            dependencyLensSource: Record<string, unknown>
        }

        // Assert
        expect(migrated.metricsLensSource.attributeTypes).toEqual({ rloc: AttributeTypeValue.absolute })
        expect(migrated.dependencyLensSource.attributeTypes).toEqual({ pairing_rate: AttributeTypeValue.relative })
    })

    it("should leave every other root untouched", () => {
        // Arrange
        const oldShapeState = v15ShapeState()

        // Act
        const migrated = migrateCcStateRecordToV16(oldShapeState) as unknown as { mapState: Record<string, unknown> }

        // Assert
        expect(migrated.mapState).toEqual({ scaling: 1 })
    })

    it("should return the record untouched when it is null or has no lens source roots", () => {
        // Arrange / Act / Assert
        expect(migrateCcStateRecordToV16(null)).toBeNull()
        const migrated = migrateCcStateRecordToV16({ files: [] }) as unknown as {
            files: unknown[]
            metricsLensSource?: unknown
            dependencyLensSource?: unknown
        }
        expect(migrated.files).toEqual([])
        expect(migrated.metricsLensSource).toBeUndefined()
        expect(migrated.dependencyLensSource).toBeUndefined()
    })
})

describe("migrateCcStateRecordToV17 (domain lens source seed transform)", () => {
    it("should seed an empty domainLensSource root when the blob predates the domain lens", () => {
        // Arrange
        const oldShapeState = { metricsLensSource: { attributeTypes: {}, attributeDescriptors: {} } }

        // Act
        const migrated = migrateCcStateRecordToV17(oldShapeState) as unknown as { domainLensSource: unknown }

        // Assert
        expect(migrated.domainLensSource).toEqual({ words: {} })
    })

    it("should leave an existing domainLensSource untouched", () => {
        // Arrange
        const words = { "/root": [{ text: "invoice", frequency: 3 }] }
        const alreadyMigrated = { domainLensSource: { words } }

        // Act
        const migrated = migrateCcStateRecordToV17(alreadyMigrated) as unknown as { domainLensSource: { words: unknown } }

        // Assert
        expect(migrated.domainLensSource.words).toBe(words)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV17(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV18 (domainState seed transform)", () => {
    it("should seed the default domainState root when the blob predates the domain settings", () => {
        // Arrange
        const oldShapeState = { metricsLensSource: { attributeTypes: {}, attributeDescriptors: {} } }

        // Act
        const migrated = migrateCcStateRecordToV18(oldShapeState) as unknown as { domainState: { topN: number } }

        // Assert
        expect(migrated.domainState.topN).toBe(150)
    })

    it("should leave an existing domainState untouched", () => {
        // Arrange
        const domainState = { topN: 25 }
        const alreadyMigrated = { domainState }

        // Act
        const migrated = migrateCcStateRecordToV18(alreadyMigrated) as unknown as { domainState: unknown }

        // Assert
        expect(migrated.domainState).toBe(domainState)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV18(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV19 (domain words backfill on persisted files)", () => {
    it("should seed empty domain words on a file state persisted before the domain lens", () => {
        // Arrange
        const fileSettings = { attributeTypes: {}, attributeDescriptors: {}, blacklist: [], markedPackages: [] }
        const oldShapeState = { files: [{ selectedAs: "Partial", file: { settings: { fileSettings } } }] }

        // Act
        const migrated = migrateCcStateRecordToV19(oldShapeState) as unknown as {
            files: Array<{ selectedAs: string; file: { settings: { fileSettings: { domainWords: unknown } } } }>
        }

        // Assert
        expect(migrated.files[0].file.settings.fileSettings.domainWords).toEqual({})
        expect(migrated.files[0].selectedAs).toBe("Partial")
    })

    it("should leave existing domain words untouched", () => {
        // Arrange
        const domainWords = { "/root": [{ text: "invoice", frequency: 3 }] }
        const alreadyMigrated = { files: [{ file: { settings: { fileSettings: { domainWords } } } }] }

        // Act
        const migrated = migrateCcStateRecordToV19(alreadyMigrated) as unknown as {
            files: Array<{ file: { settings: { fileSettings: { domainWords: unknown } } } }>
        }

        // Assert
        expect(migrated.files[0].file.settings.fileSettings.domainWords).toBe(domainWords)
    })

    it("should pass a blob without files through unchanged", () => {
        // Arrange
        const withoutFiles = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV19(withoutFiles)

        // Assert
        expect(migrated).toBe(withoutFiles)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV19(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV20 (metric rules seed on the persisted shared view)", () => {
    it("should seed empty metric rules on a shared view persisted before metric rules", () => {
        // Arrange
        const oldShapeState = { sharedView: { searchPattern: "needle", blacklist: [] } }

        // Act
        const migrated = migrateCcStateRecordToV20(oldShapeState) as unknown as {
            sharedView: { searchPattern: string; metricRules: unknown }
        }

        // Assert
        expect(migrated.sharedView.metricRules).toEqual([])
        expect(migrated.sharedView.searchPattern).toBe("needle")
    })

    it("should leave existing metric rules untouched", () => {
        // Arrange
        const metricRules = [{ id: "rule", metric: "rloc", operator: ">", threshold: 100, action: "exclude" }]
        const alreadyMigrated = { sharedView: { metricRules } }

        // Act
        const migrated = migrateCcStateRecordToV20(alreadyMigrated) as unknown as { sharedView: { metricRules: unknown } }

        // Assert
        expect(migrated.sharedView.metricRules).toBe(metricRules)
    })

    it("should pass a blob without a shared view through unchanged", () => {
        // Arrange
        const withoutSharedView = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV20(withoutSharedView)

        // Assert
        expect(migrated).toBe(withoutSharedView)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV20(null)).toBeNull()
    })
})

describe("migrateCcStateRecordToV21 (center map zoom seed on the persisted preferences)", () => {
    it("should seed the default center map zoom on preferences persisted before it", () => {
        // Arrange
        const oldShapeState = { preferences: { maxTreeMapFiles: 100 } }

        // Act
        const migrated = migrateCcStateRecordToV21(oldShapeState) as unknown as {
            preferences: { maxTreeMapFiles: number; centerMapZoom: number }
        }

        // Assert
        expect(migrated.preferences.centerMapZoom).toBe(140)
        expect(migrated.preferences.maxTreeMapFiles).toBe(100)
    })

    it("should leave an existing center map zoom untouched", () => {
        // Arrange
        const alreadyMigrated = { preferences: { centerMapZoom: 165 } }

        // Act
        const migrated = migrateCcStateRecordToV21(alreadyMigrated) as unknown as { preferences: { centerMapZoom: number } }

        // Assert
        expect(migrated.preferences.centerMapZoom).toBe(165)
    })

    it("should pass a blob without preferences through unchanged", () => {
        // Arrange
        const withoutPreferences = { domainState: { topN: 25 } }

        // Act
        const migrated = migrateCcStateRecordToV21(withoutPreferences)

        // Assert
        expect(migrated).toBe(withoutPreferences)
    })

    it("should pass a nullish blob through unchanged", () => {
        // Arrange & Act & Assert
        expect(migrateCcStateRecordToV21(null)).toBeNull()
    })
})

describe("openCodeChartaDB upgrade (v2 blob → chained v3 + v4 + v5 + v6 + v7 + v8 + v9 + v10 + v11 + v12 + v13 + v14 + v15 + v16 transforms)", () => {
    it("should re-home a persisted v2-shaped CcState blob when the DB upgrades", async () => {
        // Runs first (before any higher-version connection is opened) so a fresh fake-indexeddb starts at v2.
        const v2Database = await openDB(DB_NAME, 2, {
            upgrade(database) {
                if (!database.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
                    database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                }
                if (!database.objectStoreNames.contains(SCENARIOS_STORE_NAME)) {
                    database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
                }
            }
        })
        // A pre-Slice-5 v2 blob keeps the appearance keys + layoutAlgorithm under appSettings, the
        // color/margin stragglers under dynamicSettings, and the interaction ids under appStatus.
        const v2ShapeState = {
            ...defaultState,
            appSettings: {
                ...defaultPreferences,
                // defaultPreferences no longer spreads a flat sort-order key (Slice 10c merged it into
                // `sorting`), so seed the pre-Slice-10c flat key explicitly — v11 lifts it into
                // preferences and v12 nests it into preferences.sorting.orderAscending.
                sortingOrderAscending: false,
                isLoadingFile: false,
                experimentalFeaturesEnabled: true,
                invertHeight: true,
                amountOfTopLabels: 7,
                layoutAlgorithm: LayoutAlgorithm.StreetMap
            },
            dynamicSettings: {
                sortingOption: "NAME",
                colorMode: ColorMode.absolute,
                margin: 42,
                areaMetric: "rloc",
                focusedNodePath: ["/root/ParentLeaf"],
                searchPattern: "needle"
            },
            fileSettings: {
                edges: [],
                blacklist: [{ path: "/root/excluded", type: "exclude" }],
                markedPackages: [{ path: "/root/src", color: "#FF0000" }],
                attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: {} },
                attributeDescriptors: { rloc: { title: "Lines of Code" } }
            },
            appStatus: { currentFilesAreSampleFiles: true, hoveredNodeId: 5 }
        }
        delete (v2ShapeState as { mapState?: unknown }).mapState
        delete (v2ShapeState as { sharedView?: unknown }).sharedView
        delete (v2ShapeState as { metricsLensSource?: unknown }).metricsLensSource
        // A pre-Slice-14 v2 blob had no dependencyLensSource root (defaultState now spreads it in).
        delete (v2ShapeState as { dependencyLensSource?: unknown }).dependencyLensSource
        // A pre-Slice-10 v2 blob had no top-level fileStore flag roots — they lived nested under
        // appSettings.isLoadingFile / appStatus.currentFilesAreSampleFiles (which defaultState no longer spreads).
        delete (v2ShapeState as { isLoadingFile?: unknown }).isLoadingFile
        delete (v2ShapeState as { currentFilesAreSampleFiles?: unknown }).currentFilesAreSampleFiles
        await v2Database.put(CCSTATE_STORE_NAME, { [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID, state: v2ShapeState })
        v2Database.close()

        // openCodeChartaDB (v16, invoked by readCcState) chains the v3…v15 then v16 upgrade transforms.
        const migratedState = (await readCcState()) as unknown as {
            appSettings?: Record<string, unknown>
            dynamicSettings?: Record<string, unknown>
            appStatus?: Record<string, unknown>
            preferences: Record<string, unknown>
            mapState: Record<string, unknown>
            sharedView: Record<string, unknown>
            fileSettings?: Record<string, unknown>
            metricsLensSource: Record<string, unknown>
            dependencyLensSource: Record<string, unknown>
            isLoadingFile: boolean
            currentFilesAreSampleFiles: boolean
        }

        // v3 re-home (appearance keys + layoutAlgorithm out of appSettings)
        expect(migratedState.mapState.invertHeight).toBe(true)
        expect(migratedState.mapState.amountOfTopLabels).toBe(7)
        expect(migratedState.mapState.layoutAlgorithm).toBe(LayoutAlgorithm.StreetMap)
        // v4 re-home (stragglers out of dynamicSettings; the interaction id v4 pulled out of appStatus is
        // relocated again by v14 below)
        expect(migratedState.mapState.colorMode).toBe(ColorMode.absolute)
        expect(migratedState.mapState.margin).toBe(42)
        // v5 re-home (metric selection out of dynamicSettings)
        expect(migratedState.mapState.areaMetric).toBe("rloc")
        // v6 re-home (focus/search out of dynamicSettings into a brand-new sharedView root)
        expect(migratedState.sharedView.focusedNodePath).toEqual(["/root/ParentLeaf"])
        expect(migratedState.sharedView.searchPattern).toBe("needle")
        // v7 re-home (attributeTypes/descriptors out of fileSettings into a brand-new metricsLensSource root; the
        // attributeTypes container is unwrapped again by v16 below)
        expect(migratedState.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
        // v8 re-home (blacklist out of fileSettings into the existing sharedView root), then the v22 split
        expect(migratedState.sharedView.excludedNodes).toEqual([{ path: "/root/excluded" }])
        expect(migratedState.sharedView.flattenedNodes).toEqual([])
        // v9 re-home (markedPackages out of fileSettings into the existing sharedView root)
        expect(migratedState.sharedView.markedPackages).toEqual([{ path: "/root/src", color: "#FF0000" }])
        // v10 re-home (file-provenance flags out of appSettings/appStatus into their own top-level roots; appStatus deleted)
        expect(migratedState.isLoadingFile).toBe(false)
        expect(migratedState.currentFilesAreSampleFiles).toBe(true)
        expect(migratedState.appStatus).toBeUndefined()
        // v11 re-home (durable prefs out of appSettings + dynamicSettings.sortingOption into a new preferences root; both grab-bags deleted)
        expect(migratedState.preferences.experimentalFeaturesEnabled).toBe(true)
        expect(migratedState.appSettings).toBeUndefined()
        expect(migratedState.dynamicSettings).toBeUndefined()
        // v12 sort-merge (the two flat sort prefs nested into one preferences.sorting object)
        expect(migratedState.preferences.sorting).toEqual({ option: "NAME", orderAscending: false })
        expect("sortingOption" in migratedState.preferences).toBe(false)
        expect("sortingOrderAscending" in migratedState.preferences).toBe(false)
        // v14 re-home (interaction ids move mapState → sharedView, nulled — never restored from a stale ordinal)
        expect("hoveredNodeId" in migratedState.mapState).toBe(false)
        expect("selectedBuildingId" in migratedState.mapState).toBe(false)
        expect("rightClickedNodeData" in migratedState.mapState).toBe(false)
        expect(migratedState.sharedView.hoveredNodeId).toBeNull()
        expect(migratedState.sharedView.selectedBuildingId).toBeNull()
        expect(migratedState.sharedView.rightClickedNodeData).toBeNull()
        // v15 drop (edges was the last fileSettings member; it is now a derived dependency-lens selector, so
        // the whole fileSettings root is removed from the persisted blob)
        expect(migratedState.fileSettings).toBeUndefined()
        // v16 unwrap (v13 split the halves but kept the { nodes, edges } container on both sides; each lens source
        // now persists only the flat map it owns)
        expect(migratedState.metricsLensSource.attributeTypes).toEqual({ rloc: AttributeTypeValue.absolute })
        expect(migratedState.dependencyLensSource.attributeTypes).toEqual({})
    })
})

describe("openCodeChartaDB upgrade (v19 blob → v20 transform)", () => {
    const sharedFactory = globalThis.indexedDB

    beforeEach(() => {
        globalThis.indexedDB = new IDBFactory()
    })

    afterEach(() => {
        globalThis.indexedDB = sharedFactory
    })

    it("should restore a session saved before metric rules with no metric rules", async () => {
        // Arrange
        const v19Database = await openDB(DB_NAME, 19, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        const v19SharedView = { ...defaultSharedView }
        delete (v19SharedView as { metricRules?: unknown }).metricRules
        await v19Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, sharedView: v19SharedView }
        })
        v19Database.close()

        // Act
        const migratedState = await readCcState()

        // Assert
        expect(migratedState.sharedView.metricRules).toEqual([])
    })

    it("should restore the files of a session saved before they had a record of their own", async () => {
        // Arrange — up to v21 the files sat inside the settings record
        const loadedFiles = [{ file: { fileMeta: { fileName: "before-the-split.cc.json" } }, selectedAs: "Partial" }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act
        const migratedState = await readCcState()

        // Assert
        expect(migratedState.files).toEqual(loadedFiles)
    })

    it("should drop the derived word bank a session saved before the split still carries", async () => {
        // Arrange — up to v21 the settings record held the merged bank too
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } } }
        })
        v21Database.close()

        // Act
        const restored = await readCcState()

        // Assert — a stale bank reaching the restore would be applied over the rebuilt one
        expect(restored.domainLensSource).not.toHaveProperty("words")
    })

    it("should not even read the session when no transform applies to it", async () => {
        // Arrange — a v22 record needs only the files split, which the read path handles on its own
        const v21Database = await openDB(DB_NAME, 22, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: [{ file: { fileMeta: { fileName: "big.cc.json" } }, selectedAs: "Partial" }] }
        })
        v21Database.close()
        const getSpy = jest.spyOn(IDBObjectStore.prototype, "get")

        // Act
        const database = await openCodeChartaDB()
        database.close()

        // Assert — reading it would deserialize the whole session a second time during boot
        expect(getSpy).not.toHaveBeenCalled()
        getSpy.mockRestore()
    })

    it("should not rewrite the persisted record when a session only predates the files split", async () => {
        // Arrange
        const loadedFiles = [{ file: { fileMeta: { fileName: "untouched.cc.json" } }, selectedAs: "Partial" }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act
        await readCcState()

        // Assert — rewriting it would copy the whole session during boot and exhaust the heap
        const result = await stubReadCcState()
        expect(result.state.files).toEqual(loadedFiles)
    })

    it("should keep the files of a session that predates the split when a setting is saved first", async () => {
        // Arrange — the settings record still holds the files, and no files record exists yet
        const loadedFiles = [{ file: { fileMeta: { fileName: "kept-on-first-save.cc.json" } }, selectedAs: "Partial" }]
        const v21Database = await openDB(DB_NAME, 21, {
            upgrade(database) {
                database.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                database.createObjectStore(SCENARIOS_STORE_NAME, { keyPath: "id" })
            }
        })
        await v21Database.put(CCSTATE_STORE_NAME, {
            [CCSTATE_PRIMARY_KEY]: CCSTATE_STATE_ID,
            state: { ...defaultState, files: loadedFiles }
        })
        v21Database.close()

        // Act — a settings save strips the files out of that record
        await writeCcState({ ...defaultState, files: loadedFiles } as never)

        // Assert — so it has to put them in their own record first, or the session is gone
        const restored = await readCcState()
        expect(restored.files).toEqual(loadedFiles)
    })
})

describe("IndexedDBWriter", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("writeCcState", () => {
        it("should write the settings without the loaded files, which have a record of their own", async () => {
            // Act
            await writeCcState(defaultState)

            // Assert — a write copies its value on the main thread, so a setting must not carry the maps
            const result = await stubReadCcState()
            expect(result.state).not.toHaveProperty("files")
            expect(result.state.mapState).toEqual(defaultState.mapState)
        })

        it("should leave the loaded files alone", async () => {
            // Arrange
            const loadedFiles = [{ file: { fileMeta: { fileName: "kept.cc.json" } }, selectedAs: "Partial" }] as never

            // Act
            await writeCcFiles(loadedFiles)
            await writeCcState(defaultState)

            // Assert
            const restored = await readCcState()
            expect(restored.files).toEqual(loadedFiles)
        })

        it("should leave the derived word bank out of the record entirely, rather than persisting it empty", async () => {
            // Arrange — the bank is rebuilt from the loaded files on every load
            const stateWithMergedBank = {
                ...defaultState,
                domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } }
            }

            // Act
            await writeCcState(stateWithMergedBank)

            // Assert — an empty bank that is PRESENT would be applied over the rebuilt one and wipe it
            const result = await stubReadCcState()
            expect(result.state.domainLensSource).not.toHaveProperty("words")
        })

        it("should commit the write with strict durability so a confirmed save survives a storage-process crash", async () => {
            // Arrange
            const transactionSpy = jest.spyOn(IDBDatabase.prototype, "transaction")

            // Act
            await writeCcState(defaultState)

            // Assert
            expect(transactionSpy).toHaveBeenCalledWith(CCSTATE_STORE_NAME, "readwrite", { durability: "strict" })
            transactionSpy.mockRestore()
        })
    })

    describe("the spinner the save raises", () => {
        const pendingSavesDuring = async (write: () => Promise<void>) => {
            let wasPending = false
            const subscription = isPendingSave$.subscribe(isPending => {
                wasPending ||= isPending
            })
            await write()
            subscription.unsubscribe()
            return wasPending
        }

        it("should stay down while a settings change is written", async () => {
            // Arrange — the files have a record already, so this write carries no map
            await writeCcFiles([{ file: { fileMeta: { fileName: "loaded.cc.json" } }, selectedAs: "Partial" }] as never)

            // Act
            const raisedSpinner = await pendingSavesDuring(() => writeCcState(defaultState))

            // Assert — a settings write is a handful of names and flags; a spinner over it reads as a cost
            expect(raisedSpinner).toBe(false)
        })

        it("should go up while the loaded maps are written", async () => {
            // Arrange
            const addedMap = [{ file: { fileMeta: { fileName: "added.cc.json" } }, selectedAs: "Partial" }] as never

            // Act
            const raisedSpinner = await pendingSavesDuring(() => writeCcFiles(addedMap))

            // Assert — putting the maps structured-clones every one of them on the main thread
            expect(raisedSpinner).toBe(true)
        })

        it("should go up when a settings write has to move the loaded maps into their own record", async () => {
            // Arrange — a fresh database, so no files record exists yet: a session persisted before
            // the files got a record of their own
            const sharedFactory = globalThis.indexedDB
            globalThis.indexedDB = new IDBFactory()
            const stateHoldingFiles = {
                ...defaultState,
                files: [{ file: { fileMeta: { fileName: "unsplit.cc.json" } }, selectedAs: "Partial" }]
            } as never

            // Act
            const raisedSpinner = await pendingSavesDuring(() => writeCcState(stateHoldingFiles))

            // Assert — this one settings write does copy the maps, so it earns the spinner
            globalThis.indexedDB = sharedFactory
            expect(raisedSpinner).toBe(true)
        })

        it("should put the spinner back down when the write fails", async () => {
            // Arrange
            const putSpy = jest.spyOn(IDBObjectStore.prototype, "put").mockImplementation(() => {
                throw new Error("the quota is exhausted")
            })
            let isPending = true
            const subscription = isPendingSave$.subscribe(value => {
                isPending = value
            })

            // Act
            await expect(
                writeCcFiles([{ file: { fileMeta: { fileName: "doomed.cc.json" } }, selectedAs: "Partial" }] as never)
            ).rejects.toThrow()

            // Assert
            expect(isPending).toBe(false)
            subscription.unsubscribe()
            putSpy.mockRestore()
        })
    })

    describe("writeCcFiles", () => {
        it("should not write back the files it has just read", async () => {
            // Arrange
            await stubWriteCcState()
            await writeCcFiles([{ file: { fileMeta: { fileName: "restored.cc.json" } }, selectedAs: "Partial" }] as never)
            const restored = await readCcState()
            const putSpy = jest.spyOn(IDBObjectStore.prototype, "put")

            // Act — the store sorts a copy, so the save hands back a different array of the same states
            await writeCcFiles([...restored.files])

            // Assert — writing it would clone every loaded map to store what is already stored
            expect(putSpy).not.toHaveBeenCalled()
            putSpy.mockRestore()
        })

        it("should write the files when they are not the ones it last persisted", async () => {
            // Arrange
            await stubWriteCcState()
            await writeCcFiles([{ file: { fileMeta: { fileName: "first.cc.json" } }, selectedAs: "Partial" }] as never)
            const putSpy = jest.spyOn(IDBObjectStore.prototype, "put")

            // Act
            await writeCcFiles([{ file: { fileMeta: { fileName: "second.cc.json" } }, selectedAs: "Partial" }] as never)

            // Assert
            expect(putSpy).toHaveBeenCalled()
            putSpy.mockRestore()
            const restored = await readCcState()
            expect(restored.files[0].file.fileMeta.fileName).toBe("second.cc.json")
        })
    })

    describe("deleteCcState", () => {
        it("should successfully delete state from the database", async () => {
            await stubWriteCcState()
            await deleteCcState()

            const result = await readCcState()

            expect(result).toBeNull()
        })
    })

    describe("readCcState", () => {
        it("should successfully read the state from the database", async () => {
            await stubWriteCcState()
            const state = await readCcState()

            // everything but the derived word bank, which the restore rebuilds from the loaded files
            expect(state).toEqual({ ...defaultState, domainLensSource: {} })
        })

        it("should return null if the state cannot be read", async () => {
            const database = await openDB(DB_NAME, DB_VERSION, {
                upgrade(database_) {
                    if (!database_.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
                        database_.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
                    }
                }
            })
            const transaction = database.transaction(CCSTATE_STORE_NAME, "readwrite")
            await transaction.store.clear()
            await transaction.done
            database.close()
            const state = await readCcState()

            expect(state).toBeNull()
        })
    })
})

async function stubReadCcState() {
    const database = await openDB(DB_NAME, DB_VERSION)
    const transaction = database.transaction(CCSTATE_STORE_NAME, "readonly")
    const store = transaction.objectStore(CCSTATE_STORE_NAME)
    const result = await store.get(CCSTATE_STATE_ID)
    database.close()

    return result
}

async function stubWriteCcState() {
    const database = await openDB(DB_NAME, DB_VERSION, {
        upgrade(database_) {
            if (!database_.objectStoreNames.contains(CCSTATE_STORE_NAME)) {
                database_.createObjectStore(CCSTATE_STORE_NAME, { keyPath: CCSTATE_PRIMARY_KEY })
            }
        }
    })
    const transaction = database.transaction(CCSTATE_STORE_NAME, "readwrite")
    await transaction.store.clear()
    const store = transaction.objectStore(CCSTATE_STORE_NAME)
    await store.put({ id: CCSTATE_STATE_ID, state: defaultState })
    await transaction.done
    database.close()
}

describe("migrateCcStateRecordToV22 (blacklist split into excluded and flattened nodes)", () => {
    it("should split the one list into the two the app now keeps", () => {
        // Arrange
        const record = {
            sharedView: {
                blacklist: [
                    { path: "/root/a.ts", type: "exclude" },
                    { path: "/root/b.ts", type: "flatten", nodeType: "File" }
                ],
                searchPattern: "keep me"
            }
        }

        // Act
        const migrated = migrateCcStateRecordToV22(record) as unknown as { sharedView: Record<string, unknown> }

        // Assert — the effect moves from the entry to the list it sits in
        expect(migrated.sharedView.excludedNodes).toEqual([{ path: "/root/a.ts" }])
        expect(migrated.sharedView.flattenedNodes).toEqual([{ path: "/root/b.ts", nodeType: "File" }])
        expect(migrated.sharedView.blacklist).toBeUndefined()
        expect(migrated.sharedView.searchPattern).toBe("keep me")
    })

    it("should leave a record that has already been split untouched", () => {
        // Arrange
        const record = { sharedView: { excludedNodes: [{ path: "/root/a.ts" }], flattenedNodes: [] } }

        // Act
        const migrated = migrateCcStateRecordToV22(record)

        // Assert
        expect(migrated).toBe(record)
    })

    it("should return the record untouched when it is null", () => {
        // Act & Assert
        expect(migrateCcStateRecordToV22(null)).toBeNull()
    })
})
