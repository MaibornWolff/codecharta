import { Scenario, ScenarioSectionKey } from "../../model/scenario.model"

export interface ScenarioView {
    scenario: Scenario
    warning: boolean
    mapMismatch: boolean
    mapBound: boolean
    sectionKeys: ScenarioSectionKey[]
    formattedDate: string
}
