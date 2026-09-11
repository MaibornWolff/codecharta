import { defaultState } from "../../../stores/rootStore/state.manager"
import {
    getSettingKeysOfGroup,
    METRIC_SELECTION_SETTING_KEYS,
    readScenarioSettings,
    SCENARIO_GROUP_ICONS,
    SCENARIO_GROUP_KEYS,
    SCENARIO_GROUP_LABELS,
    SCENARIO_SETTING_KEYS,
    SCENARIO_SETTINGS,
    ScenarioSettingKey,
    ScenarioSettings,
    ScenarioSettingsSource
} from "./scenarioSettings.registry"

const patchOf = (key: ScenarioSettingKey, settings: ScenarioSettings) => SCENARIO_SETTINGS[key].patch?.(settings)

const source: ScenarioSettingsSource = {
    state: defaultState,
    camera: { position: { x: 100, y: 200, z: 300 }, target: { x: 10, y: 0, z: 20 } }
}

describe("scenario settings registry", () => {
    describe("readScenarioSettings", () => {
        it("should read only the selected settings", () => {
            // Act
            const settings = readScenarioSettings(source, new Set<ScenarioSettingKey>(["margin", "camera"]))

            // Assert
            expect(Object.keys(settings)).toEqual(["margin", "camera"])
            expect(settings.margin).toBe(defaultState.mapState.margin)
            expect(settings.camera).toEqual(source.camera)
        })

        it("should read nothing when nothing is selected", () => {
            // Act
            const settings = readScenarioSettings(source, new Set<ScenarioSettingKey>())

            // Assert
            expect(settings).toEqual({})
        })

        it("should read a value for every setting of the registry", () => {
            // Act
            const settings = readScenarioSettings(source, new Set(SCENARIO_SETTING_KEYS))

            // Assert
            expect(Object.keys(settings).sort()).toEqual([...SCENARIO_SETTING_KEYS].sort())
        })

        it("should read the height scaling from the y axis", () => {
            // Act
            const settings = readScenarioSettings(source, new Set<ScenarioSettingKey>(["heightScaling"]))

            // Assert
            expect(settings.heightScaling).toBe(defaultState.mapState.scaling.y)
        })
    })

    describe("patches", () => {
        const settings = readScenarioSettings(source, new Set(SCENARIO_SETTING_KEYS))

        it("should patch state for every setting but the camera", () => {
            // Act
            const keysWithoutPatch = SCENARIO_SETTING_KEYS.filter(key => SCENARIO_SETTINGS[key].patch === undefined)

            // Assert
            expect(keysWithoutPatch).toEqual(["camera"])
        })

        it("should patch a non-empty slice for every setting that has a patch", () => {
            // Act
            const emptyPatches = SCENARIO_SETTING_KEYS.filter(key => {
                const patch = patchOf(key, settings)
                return patch !== undefined && Object.keys(patch).length === 0
            })

            // Assert
            expect(emptyPatches).toEqual([])
        })

        it("should patch the height scaling without touching the other axes", () => {
            // Act
            const patch = patchOf("heightScaling", { heightScaling: 3 })

            // Assert
            expect(patch).toEqual({ mapState: { scaling: { y: 3 } } })
        })

        it("should patch band colors and edge colors separately", () => {
            // Act
            const bandPatch = patchOf("mapColors", { mapColors: { positive: "#00FF00" } })
            const edgePatch = patchOf("edgeColors", { edgeColors: { outgoingEdge: "#FF1D8E" } })

            // Assert
            expect(bandPatch).toEqual({ mapState: { mapColors: { positive: "#00FF00" } } })
            expect(edgePatch).toEqual({ mapState: { mapColors: { outgoingEdge: "#FF1D8E" } } })
        })

        it("should patch the metric rules as a whole list", () => {
            // Arrange
            const metricRules: ScenarioSettings["metricRules"] = [
                { id: "rule-1", metric: "mcc", operator: "gt", value: 10, type: "flatten" }
            ]

            // Act
            const patch = patchOf("metricRules", { metricRules })

            // Assert
            expect(patch).toEqual({ sharedView: { metricRules } })
        })
    })

    describe("groups", () => {
        it("should group the settings the way the metrics bar groups its controls", () => {
            // Assert
            expect(SCENARIO_GROUP_KEYS).toEqual(["area", "height", "color", "edge", "labels", "camera", "filters"])
            expect(getSettingKeysOfGroup("height")).toEqual(["heightMetric", "heightScaling", "invertHeight"])
            expect(getSettingKeysOfGroup("camera")).toEqual(["camera"])
            expect(getSettingKeysOfGroup("filters")).toEqual(["blacklist", "metricRules", "focusedNodePath"])
        })

        it("should assign every setting to a group that has a label and an icon", () => {
            // Assert
            for (const key of SCENARIO_SETTING_KEYS) {
                const group = SCENARIO_SETTINGS[key].group
                expect(SCENARIO_GROUP_KEYS).toContain(group)
                expect(SCENARIO_GROUP_LABELS[group]).toBeTruthy()
                expect(SCENARIO_GROUP_ICONS[group]).toBeTruthy()
            }
        })

        it("should give every setting a label", () => {
            // Assert
            for (const key of SCENARIO_SETTING_KEYS) {
                expect(SCENARIO_SETTINGS[key].label).toBeTruthy()
            }
        })

        it("should mark the four metric selections", () => {
            // Assert
            expect(METRIC_SELECTION_SETTING_KEYS).toEqual(["areaMetric", "heightMetric", "colorMetric", "edgeMetric"])
        })
    })
})
