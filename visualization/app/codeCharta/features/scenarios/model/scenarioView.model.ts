import { Scenario } from "./scenario.model"
import { ScenarioGroupKey } from "./scenarioSettings.registry"

export interface ScenarioView {
    scenario: Scenario
    warning: boolean
    mapMismatch: boolean
    mapBound: boolean
    groupKeys: ScenarioGroupKey[]
    formattedDate: string
}
