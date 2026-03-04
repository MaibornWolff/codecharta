import { Injectable } from "@angular/core"
import { ScenarioApplierService } from "./services/scenarioApplier.service"

export { ScenarioIndexedDBService } from "./stores/scenarioIndexedDB"

@Injectable({ providedIn: "root" })
export class ScenariosFacade {
    constructor(private readonly scenarioApplierService: ScenarioApplierService) {}

    get isApplying(): boolean {
        return this.scenarioApplierService.isApplying
    }
}
