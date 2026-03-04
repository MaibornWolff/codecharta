import { openCodeChartaDB, SCENARIOS_STORE_NAME } from "../../../util/indexedDB/indexedDBWriter"
import { Scenario } from "../model/scenario.model"

export async function readAllScenarios(): Promise<Scenario[]> {
    const database = await openCodeChartaDB()
    const all = await database.getAll(SCENARIOS_STORE_NAME)
    return all as Scenario[]
}

export async function addScenario(scenario: Scenario): Promise<void> {
    const database = await openCodeChartaDB()
    const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
    await tx.store.add(scenario)
    await tx.done
}

export async function updateScenario(scenario: Scenario): Promise<void> {
    const database = await openCodeChartaDB()
    const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
    await tx.store.put(scenario)
    await tx.done
}

export async function deleteScenario(id: string): Promise<void> {
    const database = await openCodeChartaDB()
    const tx = database.transaction(SCENARIOS_STORE_NAME, "readwrite")
    await tx.store.delete(id)
    await tx.done
}
