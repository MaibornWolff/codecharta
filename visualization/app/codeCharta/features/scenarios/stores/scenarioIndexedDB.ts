import { Injectable } from "@angular/core"
import { openCodeChartaDB, SCENARIOS_STORE_NAME } from "../../../util/indexedDB/indexedDBWriter"
import { Scenario } from "../model/scenario.model"

@Injectable({ providedIn: "root" })
export class ScenarioIndexedDBService {
    async readAll(): Promise<Scenario[]> {
        const database = await openCodeChartaDB()
        const all = await database.getAll(SCENARIOS_STORE_NAME)
        return all as Scenario[]
    }

    async add(scenario: Scenario): Promise<void> {
        const database = await openCodeChartaDB()
        const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
        await tx.store.add(scenario)
        await tx.done
    }

    async update(scenario: Scenario): Promise<void> {
        const database = await openCodeChartaDB()
        const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
        await tx.store.put(scenario)
        await tx.done
    }

    async delete(id: string): Promise<void> {
        const database = await openCodeChartaDB()
        const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
        await tx.store.delete(id)
        await tx.done
    }
}
