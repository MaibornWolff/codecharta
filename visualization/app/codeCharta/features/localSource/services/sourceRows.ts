/** Rows drawn as one block; a block out of view is skipped by the browser until it scrolls near. */
const ROWS_PER_BLOCK = 500
const SPAN_OR_LINE_BREAK = /<span[^>]*>|<\/span>|\n/g

export function plainRowsHtml(text: string): string {
    return rowsHtmlOf(linesOf(text).map(escapeHtml))
}

/** Prism's HTML keeps a token that spans lines, such as a block comment, in one span; each row closes the spans
 * still open at its end and reopens them in the next row, so every row stands on its own. */
export function highlightedRowsHtml(highlightedHtml: string): string {
    const lines: string[] = []
    const openSpans: string[] = []
    let line = ""
    let position = 0
    for (const match of highlightedHtml.matchAll(SPAN_OR_LINE_BREAK)) {
        line += highlightedHtml.slice(position, match.index)
        position = match.index + match[0].length
        if (match[0] === "\n") {
            lines.push(line + "</span>".repeat(openSpans.length))
            line = openSpans.join("")
        } else {
            line += match[0]
            if (match[0] === "</span>") {
                openSpans.pop()
            } else {
                openSpans.push(match[0])
            }
        }
    }
    lines.push(line + highlightedHtml.slice(position))
    return rowsHtmlOf(withoutClosingEmptyLine(lines))
}

export function lineCountOf(text: string): number {
    return linesOf(text).length
}

function linesOf(text: string): string[] {
    return withoutClosingEmptyLine(text.split("\n"))
}

/** A file ending in a line break has no line after it, as an editor counts. */
function withoutClosingEmptyLine(lines: string[]): string[] {
    return lines.length > 1 && lines.at(-1) === "" ? lines.slice(0, -1) : lines
}

function rowsHtmlOf(lines: string[]): string {
    const blocks: string[] = []
    for (let start = 0; start < lines.length; start += ROWS_PER_BLOCK) {
        const rows = lines
            .slice(start, start + ROWS_PER_BLOCK)
            .map(
                (line, offset) =>
                    `<div class="cc-source-row"><span class="cc-source-number">${start + offset + 1}</span><span class="cc-source-code">${line}</span></div>`
            )
        blocks.push(`<div class="cc-source-block">${rows.join("")}</div>`)
    }
    return blocks.join("")
}

function escapeHtml(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}
