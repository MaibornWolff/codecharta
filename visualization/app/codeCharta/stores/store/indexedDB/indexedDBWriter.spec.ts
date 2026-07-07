import "fake-indexeddb/auto"
import { openDB } from "idb"
import { defaultState } from "../state.manager"
import { defaultPreferences } from "../../preferences/preferences.read.facade"
import { defaultMapState } from "../../mapState/mapState.read.facade"
import { defaultSharedView } from "../../sharedView/sharedView.read.facade"
import { defaultMetricsLensSource } from "../../metricsLensSource/metricsLensSource.read.facade"
import { defaultDependencyLensSource } from "../../dependencyLensSource/dependencyLensSource.read.facade"
import { AttributeTypeValue, ColorMode, LayoutAlgorithm } from "../../../model/codeCharta.model"
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
    readCcState,
    SCENARIOS_STORE_NAME,
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

    it("should fill sharedView blacklist with its default when absent from the old blob", () => {
        const migrated = migrateCcStateRecordToV8({ fileSettings: {} }) as unknown as { sharedView: Record<string, unknown> }

        expect(migrated.sharedView.blacklist).toEqual(defaultSharedView.blacklist)
    })

    it("should return the record untouched when it is null, and build a default sharedView blacklist when there is no fileSettings", () => {
        expect(migrateCcStateRecordToV8(null)).toBeNull()
        const migrated = migrateCcStateRecordToV8({ files: [] }) as unknown as { files: unknown[]; sharedView: Record<string, unknown> }
        expect(migrated.files).toEqual([])
        expect(migrated.sharedView.blacklist).toEqual(defaultSharedView.blacklist)
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

describe("openCodeChartaDB upgrade (v2 blob → chained v3 + v4 + v5 + v6 + v7 + v8 + v9 + v10 + v11 + v12 + v13 + v14 transforms)", () => {
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

        // openCodeChartaDB (v15, invoked by readCcState) chains the v3…v14 then v15 upgrade transforms.
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
        // v7 re-home (attributeTypes/descriptors out of fileSettings into a brand-new metricsLensSource root)
        expect(migratedState.metricsLensSource.attributeTypes).toEqual({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} })
        expect(migratedState.metricsLensSource.attributeDescriptors).toEqual({ rloc: { title: "Lines of Code" } })
        // v8 re-home (blacklist out of fileSettings into the existing sharedView root)
        expect(migratedState.sharedView.blacklist).toEqual([{ path: "/root/excluded", type: "exclude" }])
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
        // v13 edge-attributeTypes split (edge side out of metricsLensSource into a brand-new dependencyLensSource root)
        expect(migratedState.dependencyLensSource.attributeTypes).toEqual({ nodes: {}, edges: {} })
        expect(migratedState.metricsLensSource.attributeTypes).toEqual({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} })
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
    })
})

describe("IndexedDBWriter", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("writeCcState", () => {
        it("should successfully write state to the database", async () => {
            await writeCcState(defaultState)

            const result = await stubReadCcState()

            expect(result.state).toEqual(defaultState)
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

            expect(state).toEqual(defaultState)
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
