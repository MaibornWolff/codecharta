import { HttpClient, HttpResponse } from "@angular/common/http"
import { firstValueFrom } from "rxjs"
import { NameDataPair } from "../../../../codeCharta.api.model"
import { getCCFileAndDecorateFileChecksum } from "./ccFileHelper"
import { isCcJson2 } from "./fileValidator"
import { ExportCCFile, ExportWrappedCCFile } from "../../../../codeCharta.api.model"
import { CcJson2 } from "../../../../model/ccjson2.model"
import { ungzip } from "pako"

function getProjectName(content: ExportCCFile | CcJson2): string {
    return isCcJson2(content) ? content.meta.projectName : content.projectName
}

export class UrlExtractor {
    constructor(private readonly httpClient: HttpClient) {}

    getParameterByName(name: string) {
        const sanitizedName = name.replaceAll(/[[\]]/g, "\\$&")
        const regex = new RegExp(`[?&]${sanitizedName}(=([^&#]*)|&|#|$)`),
            results = regex.exec(window.location.href)

        if (!results) {
            return null
        }
        if (!results[2]) {
            return ""
        }
        return decodeURIComponent(results[2].replaceAll("+", " "))
    }

    async getFileDataFromQueryParam() {
        const queryParameters = new URLSearchParams(window.location.search)
        const fileNames = queryParameters.getAll("file")

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
        if (fileName.endsWith(".gz")) {
            return this.getUnzippedFile(fileName)
        }
        return this.getFile(fileName)
    }

    private async getUnzippedFile(fileName: string): Promise<NameDataPair> {
        const response: HttpResponse<ArrayBuffer> = await firstValueFrom(
            this.httpClient.get(fileName, { responseType: "arraybuffer", observe: "response" })
        )
        if (response.status >= 200 && response.status < 300) {
            const data = response.body
            const responseData: string | ExportCCFile | ExportWrappedCCFile = ungzip(data, { to: "string" })
            const content = getCCFileAndDecorateFileChecksum(responseData)
            const parsedFileName = this.getFileName(fileName, getProjectName(content))
            // see #3111 and PR #3110 for reason of hard coded file size
            return { fileName: parsedFileName, fileSize: 13, content }
        }
        throw new Error(`Could not load file "${fileName}"`)
    }

    private async getFile(fileName: string): Promise<NameDataPair> {
        const response = await firstValueFrom(this.httpClient.get(fileName, { observe: "response" }))

        if (response.status >= 200 && response.status < 300) {
            const responseData = response.body as string | ExportCCFile | ExportWrappedCCFile
            const content: ExportCCFile | CcJson2 = getCCFileAndDecorateFileChecksum(responseData)
            fileName = this.getFileName(fileName, getProjectName(content))
            // see #3111 and PR #3110 for reason of hard coded file size
            return { fileName, fileSize: 15, content }
        }
        throw new Error(`Could not load file "${fileName}"`)
    }

    getFileName(oldFileName: string, projectName: string): string {
        return projectName?.trim() || oldFileName.split("/").pop()
    }
}
