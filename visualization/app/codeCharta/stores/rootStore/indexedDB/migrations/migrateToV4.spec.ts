import { ColorMode, LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { defaultMapState } from "../../../mapState/mapState.read.facade"
import { migrateCcStateRecordToV4 } from "./migrateToV4"

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
