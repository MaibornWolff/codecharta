const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}

export function escapeHtml(text: string): string {
    return text.replaceAll(/[&<>"']/g, character => HTML_ESCAPES[character])
}
