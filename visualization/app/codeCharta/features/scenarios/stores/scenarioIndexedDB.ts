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
        // Await both together so the transaction's done promise is always handled,
        // even when the request rejects (e.g. duplicate id) and aborts the transaction.
        await Promise.all([tx.store.add(scenario), tx.done])
    }

    async update(scenario: Scenario): Promise<void> {
        const database = await openCodeChartaDB()
        const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
        await Promise.all([tx.store.put(scenario), tx.done])
    }

    async delete(id: string): Promise<void> {
        const database = await openCodeChartaDB()
        const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
        await Promise.all([tx.store.delete(id), tx.done])
    }
}
