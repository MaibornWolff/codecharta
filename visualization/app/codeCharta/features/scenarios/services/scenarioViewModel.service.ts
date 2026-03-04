import { Injectable } from "@angular/core"
import { MetricData } from "../../../codeCharta.model"
import { getAvailableSectionKeys, Scenario } from "../model/scenario.model"
import { ScenarioApplierService } from "./scenarioApplier.service"
import { ScenarioView } from "../components/scenarioListDialog/scenarioView.model"

const GROUP_DEFINITIONS: { priority: number; label: string; icon: string }[] = [
    { priority: 0, label: "Current Map", icon: "fa-map-pin" },
    { priority: 1, label: "Global", icon: "fa-globe" },
    { priority: 2, label: "Built-in", icon: "fa-cube" },
    { priority: 3, label: "Other Maps", icon: "fa-map-o" }
]

interface RawScenarioGroup {
    label: string
    icon: string
    scenarios: Scenario[]
}

@Injectable({ providedIn: "root" })
export class ScenarioViewModelService {
    constructor(private readonly scenarioApplier: ScenarioApplierService) {}

    groupScenarios(scenarios: Scenario[], visibleFileNames: Set<string>): RawScenarioGroup[] {
        const buckets = new Map<number, Scenario[]>()
        for (const scenario of scenarios) {
            const priority = this.getScenarioPriority(scenario, visibleFileNames)
            const bucket = buckets.get(priority)
            if (bucket) {
                bucket.push(scenario)
            } else {
                buckets.set(priority, [scenario])
            }
        }
        return GROUP_DEFINITIONS.filter(def => buckets.has(def.priority)).map(def => ({
            label: def.label,
            icon: def.icon,
            scenarios: buckets.get(def.priority) ?? []
        }))
    }

    toScenarioView(scenario: Scenario, visibleFileNames: Set<string>, metricData: MetricData): ScenarioView {
        const mapBound = (scenario.mapFileNames?.length ?? 0) > 0
        const mapMismatch = mapBound && !scenario.mapFileNames.some(name => visibleFileNames.has(name))
        const warning = scenario.sections.metrics
            ? this.scenarioApplier.hasMissingMetrics(this.scenarioApplier.getMissingMetrics(scenario.sections.metrics, metricData))
            : false
        return {
            scenario,
            warning,
            mapMismatch,
            mapBound,
            sectionKeys: getAvailableSectionKeys(scenario),
            formattedDate: new Date(scenario.createdAt).toLocaleDateString()
        }
    }

    getScenarioPriority(scenario: Scenario, visibleFileNames: Set<string>): number {
        const isBound = (scenario.mapFileNames?.length ?? 0) > 0
        if (isBound && scenario.mapFileNames?.some(name => visibleFileNames.has(name))) {
            return 0
        }
        if (!isBound && !scenario.isBuiltIn) {
            return 1
        }
        if (scenario.isBuiltIn) {
            return 2
        }
        return 3
    }
}
