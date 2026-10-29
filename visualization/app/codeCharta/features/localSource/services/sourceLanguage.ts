/** Prism's grammar for each file extension the analysis knows; ABL has no Prism grammar and stays plain. */
const LANGUAGE_BY_EXTENSION: Readonly<Record<string, string>> = {
    kt: "kotlin",
    kts: "kotlin",
    java: "java",
    ts: "typescript",
    cts: "typescript",
    mts: "typescript",
    tsx: "tsx",
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    jsx: "jsx",
    py: "python",
    pyw: "python",
    cs: "csharp",
    go: "go",
    c: "c",
    h: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    hxx: "cpp",
    "h++": "cpp",
    m: "objectivec",
    mm: "objectivec",
    php: "php",
    phtml: "php",
    rb: "ruby",
    rake: "ruby",
    gemspec: "ruby",
    swift: "swift",
    rs: "rust",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    sql: "sql",
    html: "markup",
    vue: "markup",
    xml: "markup",
    svg: "markup",
    css: "css",
    scss: "scss",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown"
}

export function sourceLanguageOf(filePath: string): string | null {
    const fileName = filePath.slice(filePath.lastIndexOf("/") + 1)
    const extensionStart = fileName.lastIndexOf(".")
    if (extensionStart <= 0) {
        return null
    }
    return LANGUAGE_BY_EXTENSION[fileName.slice(extensionStart + 1).toLowerCase()] ?? null
}
