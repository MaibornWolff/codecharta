import { Injectable } from "@angular/core"
import { CCSCENARIO_EXTENSION, fromScenarioFile, Scenario, ScenarioFile, toScenarioFile } from "../model/scenario.model"
import { FileDownloader } from "../../../util/fileDownloader"
import { ScenarioIndexedDBService } from "../stores/scenarioIndexedDB"
import { ScenariosService } from "./scenarios.service"

export interface ScenarioImportResult {
    imported: number
    duplicates: string[]
    invalid: string[]
    parseErrors: string[]
}

@Injectable({ providedIn: "root" })
export class ScenarioImportExportService {
    constructor(
        private readonly scenariosService: ScenariosService,
        private readonly db: ScenarioIndexedDBService
    ) {}

    exportScenario(scenario: Scenario): void {
        const file = toScenarioFile(scenario)
        const sanitizedName = scenario.name.replaceAll(/[^\w-]/g, "_")
        FileDownloader.downloadData(JSON.stringify(file, null, 2), sanitizedName + CCSCENARIO_EXTENSION)
    }

    async importScenarioFiles(files: FileList): Promise<ScenarioImportResult> {
        const existing = this.scenariosService.scenarios$.getValue()
        const result: ScenarioImportResult = { imported: 0, duplicates: [], invalid: [], parseErrors: [] }
        for (const file of files) {
            let parsed: ScenarioFile
            try {
                const text = await file.text()
                parsed = JSON.parse(text) as ScenarioFile
            } catch {
                result.parseErrors.push(file.name)
                continue
            }
            if (parsed.schemaVersion !== 1 || !parsed.name || !parsed.sections) {
                result.invalid.push(file.name)
                continue
            }
            if (this.isDuplicate(parsed, existing)) {
                result.duplicates.push(parsed.name)
                continue
            }
            const scenario = fromScenarioFile(parsed)
            existing.push(scenario)
            await this.db.add(scenario)
            result.imported++
        }
        if (result.imported > 0) {
            await this.scenariosService.loadScenarios()
        }
        return result
    }

    private isDuplicate(file: ScenarioFile, existing: Scenario[]): boolean {
        return existing.some(s => s.name === file.name && JSON.stringify(s.sections) === JSON.stringify(file.sections))
    }
}
