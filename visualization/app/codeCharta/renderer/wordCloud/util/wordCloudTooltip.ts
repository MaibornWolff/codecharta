import { WordCloudTooltipParams } from "./wordCloudOption.model"

const TFIDF_TOOLTIP_DIGITS = 3

const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}

export function buildTooltipFormatter(): (params: WordCloudTooltipParams) => string {
    return ({ name, data }) => {
        const rows = [`<b>${escapeHtml(name)}</b>`, `Frequency: ${data.frequency}`]
        if (data.tfidf !== undefined) {
            rows.push(`TF-IDF: ${data.tfidf.toFixed(TFIDF_TOOLTIP_DIGITS)}`)
        }
        return rows.join("<br/>")
    }
}

/** A word is whatever the loaded cc.json says it is, and echarts renders this string as tooltip HTML. */
const escapeHtml = (text: string): string => text.replaceAll(/[&<>"']/g, character => HTML_ESCAPES[character])
