import { Vector3 } from "three"
import { DEFAULT_STATE, STATE } from "../../../../../util/dataMocks"
import { getInitialScenarioMetricProperties } from "./getInitialScenarioMetricProperties"

describe("getInitialScenarioMetricProperties", () => {
    it("should INCLUDE 'Edge-Metric' when there are edge metrics available", () => {
        const initialScenarioMetricProperties = getInitialScenarioMetricProperties(STATE, {
            camera: new Vector3(0, 300, 1000),
            cameraTarget: new Vector3(1, 1, 1)
        })
        expect(initialScenarioMetricProperties.find(p => p.metricType === "Edge-Metric")).not.toBe(undefined)
    })

    it("should EXCLUDE 'Edge-Metric' when there are no edge metrics available", () => {
        const initialScenarioMetricProperties = getInitialScenarioMetricProperties(DEFAULT_STATE, {
            camera: new Vector3(0, 300, 1000),
            cameraTarget: new Vector3(1, 1, 1)
        })
        expect(initialScenarioMetricProperties.find(p => p.metricType === "Edge-Metric")).toBe(undefined)
    })
})
