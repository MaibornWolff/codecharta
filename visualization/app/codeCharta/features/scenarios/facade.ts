import { Injectable } from "@angular/core"
import { ScenarioApplierService } from "./services/scenarioApplier.service"

export { ScenarioIndexedDBService } from "./stores/scenarioIndexedDB"
export { ScenariosService } from "./services/scenarios.service"
export type { Scenario } from "./model/scenario.model"

@Injectable({ providedIn: "root" })
export class ScenariosFacade {
    constructor(private readonly scenarioApplierService: ScenarioApplierService) {}

    get isApplying(): boolean {
        return this.scenarioApplierService.isApplying
    }
}
