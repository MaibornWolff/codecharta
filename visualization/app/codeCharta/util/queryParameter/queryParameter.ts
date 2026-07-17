export enum QueryParameter {
    file = "file",
    mode = "mode",
    areaMetric = "area",
    heightMetric = "height",
    colorMetric = "color",
    edgeMetric = "edge",
    currentFilesAreSampleFiles = "currentFilesAreSampleFiles"
}

/** The metric selection a `?file=` URL asks for. `null` means "the URL does not say". */
export interface UrlMetricSelection {
    areaMetric: string | null
    heightMetric: string | null
    colorMetric: string | null
    edgeMetric: string | null
}

export const NO_URL_METRICS: UrlMetricSelection = {
    areaMetric: null,
    heightMetric: null,
    colorMetric: null,
    edgeMetric: null
}
