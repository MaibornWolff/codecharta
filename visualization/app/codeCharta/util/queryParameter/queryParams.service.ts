import { Injectable } from "@angular/core"
import { QueryParameter, UrlMetricSelection } from "./queryParameter"

export interface QueryParamsWrite {
    areaMetric: string
    heightMetric: string
    colorMetric: string
    edgeMetric: string | null
    isEdgeMetricDefined: boolean
    currentFilesAreSampleFiles: boolean
}

/**
 * The single owner of the URL query string. Nothing else in the app may touch
 * window.location or window.history.
 */
@Injectable({ providedIn: "root" })
export class QueryParamsService {
    hasFile(): boolean {
        // Only the first `file` parameter counts, and an empty first value means "no file".
        // `?file=&file=x.json` therefore boots from IndexedDB, not from the URL.
        const [firstFileName] = this.read().getAll(QueryParameter.file)
        return Boolean(firstFileName)
    }

    getFileNames(): string[] {
        return this.read().getAll(QueryParameter.file)
    }

    getRenderMode(): string | null {
        return this.read().get(QueryParameter.mode)
    }

    getMetrics(): UrlMetricSelection {
        const parameters = this.read()
        return {
            areaMetric: parameters.get(QueryParameter.areaMetric),
            heightMetric: parameters.get(QueryParameter.heightMetric),
            colorMetric: parameters.get(QueryParameter.colorMetric),
            edgeMetric: parameters.get(QueryParameter.edgeMetric)
        }
    }

    areSampleFilesFlagged(): boolean {
        return this.read().get(QueryParameter.currentFilesAreSampleFiles) === "true"
    }

    write(values: QueryParamsWrite): void {
        if (!this.hasFile()) {
            return
        }

        const url = new URL(window.location.href)
        const parameters = url.searchParams
        parameters.set(QueryParameter.areaMetric, String(values.areaMetric))
        parameters.set(QueryParameter.heightMetric, String(values.heightMetric))
        parameters.set(QueryParameter.colorMetric, String(values.colorMetric))

        if (values.isEdgeMetricDefined) {
            parameters.set(QueryParameter.edgeMetric, String(values.edgeMetric))
        } else {
            parameters.delete(QueryParameter.edgeMetric)
        }

        if (values.currentFilesAreSampleFiles) {
            parameters.set(QueryParameter.currentFilesAreSampleFiles, "true")
        } else {
            parameters.delete(QueryParameter.currentFilesAreSampleFiles)
        }

        window.history.replaceState(null, "", url.toString())
    }

    private read(): URLSearchParams {
        return new URLSearchParams(window.location.search)
    }
}
