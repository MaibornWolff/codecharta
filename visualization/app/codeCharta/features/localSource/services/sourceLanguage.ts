export interface SourceLanguage {
    /** Prism's grammar; null where Prism has none, as for ABL, and the file stays plain. */
    grammar: string | null
    label: string
}

const PLAIN_TEXT: SourceLanguage = { grammar: null, label: "Plain text" }

const KOTLIN = { grammar: "kotlin", label: "Kotlin" }
const TYPESCRIPT = { grammar: "typescript", label: "TypeScript" }
const JAVASCRIPT = { grammar: "javascript", label: "JavaScript" }
const PYTHON = { grammar: "python", label: "Python" }
const C = { grammar: "c", label: "C" }
const CPP = { grammar: "cpp", label: "C++" }
const OBJECTIVE_C = { grammar: "objectivec", label: "Objective-C" }
const PHP = { grammar: "php", label: "PHP" }
const RUBY = { grammar: "ruby", label: "Ruby" }
const SHELL = { grammar: "bash", label: "Shell" }
const YAML = { grammar: "yaml", label: "YAML" }

const LANGUAGE_BY_EXTENSION: Readonly<Record<string, SourceLanguage>> = {
    kt: KOTLIN,
    kts: KOTLIN,
    java: { grammar: "java", label: "Java" },
    ts: TYPESCRIPT,
    cts: TYPESCRIPT,
    mts: TYPESCRIPT,
    tsx: { grammar: "tsx", label: "TSX" },
    js: JAVASCRIPT,
    mjs: JAVASCRIPT,
    cjs: JAVASCRIPT,
    jsx: { grammar: "jsx", label: "JSX" },
    py: PYTHON,
    pyw: PYTHON,
    cs: { grammar: "csharp", label: "C#" },
    go: { grammar: "go", label: "Go" },
    c: C,
    h: C,
    cpp: CPP,
    cc: CPP,
    cxx: CPP,
    hpp: CPP,
    hxx: CPP,
    "h++": CPP,
    m: OBJECTIVE_C,
    mm: OBJECTIVE_C,
    php: PHP,
    phtml: PHP,
    rb: RUBY,
    rake: RUBY,
    gemspec: RUBY,
    swift: { grammar: "swift", label: "Swift" },
    rs: { grammar: "rust", label: "Rust" },
    sh: SHELL,
    bash: SHELL,
    zsh: SHELL,
    sql: { grammar: "sql", label: "SQL" },
    html: { grammar: "markup", label: "HTML" },
    vue: { grammar: "markup", label: "Vue" },
    xml: { grammar: "markup", label: "XML" },
    svg: { grammar: "markup", label: "SVG" },
    css: { grammar: "css", label: "CSS" },
    scss: { grammar: "scss", label: "SCSS" },
    json: { grammar: "json", label: "JSON" },
    yaml: YAML,
    yml: YAML,
    md: { grammar: "markdown", label: "Markdown" },
    p: { grammar: null, label: "ABL" },
    cls: { grammar: null, label: "ABL" },
    w: { grammar: null, label: "ABL" }
}

export function sourceLanguageOf(filePath: string): SourceLanguage {
    const fileName = filePath.slice(filePath.lastIndexOf("/") + 1)
    const extensionStart = fileName.lastIndexOf(".")
    if (extensionStart <= 0) {
        return PLAIN_TEXT
    }
    return LANGUAGE_BY_EXTENSION[fileName.slice(extensionStart + 1).toLowerCase()] ?? PLAIN_TEXT
}
