import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { firstValueFrom } from "rxjs"
import { CcJson2 } from "../../../../../model/ccjson2.model"
import { ExportCCFile, NameDataPair } from "../../../../../model/codeCharta.api.model"
import { parseCcFileBytes } from "./ccFileHelper"
import { isCcJson2 } from "./fileValidator"

function getProjectName(content: ExportCCFile | CcJson2 | null): string | undefined {
    if (!content) {
        return undefined
    }
    return isCcJson2(content) ? content.meta.projectName : content.projectName
}

@Injectable({ providedIn: "root" })
export class UrlExtractor {
    constructor(private readonly httpClient: HttpClient) {}

    async getFileDataFromFileNames(fileNames: string[]) {
        if (fileNames.length === 0) {
            throw new Error("Filename is missing")
        }

        return Promise.all(
            fileNames.map(async fileName => {
                return this.getFileDataFromFile(fileName)
            })
        )
    }

    async getFileDataFromFile(fileName: string): Promise<NameDataPair> {
        if (!fileName) {
            throw new Error(`Filename is missing`)
        }
        const response = await firstValueFrom(this.httpClient.get(fileName, { responseType: "arraybuffer", observe: "response" }))
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Could not load file "${fileName}"`)
        }
        const content = await parseCcFileBytes(new Uint8Array(response.body))
        return { fileName: this.getFileName(fileName, getProjectName(content)), fileSize: response.body.byteLength, content }
    }

    getFileName(oldFileName: string, projectName: string): string {
        return projectName?.trim() || oldFileName.split("/").pop()
    }
}
