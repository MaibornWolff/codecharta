import { Scenario, ScenarioSectionKey } from "./scenario.model"

export interface ScenarioView {
    scenario: Scenario
    warning: boolean
    mapMismatch: boolean
    mapBound: boolean
    sectionKeys: ScenarioSectionKey[]
    formattedDate: string
}
