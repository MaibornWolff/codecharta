import "./prismManualMode"
import Prism from "prismjs"
// Each grammar extends the ones before it, so the order follows Prism's own dependencies.
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-objectivec"
import "prismjs/components/prism-java"
import "prismjs/components/prism-kotlin"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-go"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-markup-templating"
import "prismjs/components/prism-php"
import "prismjs/components/prism-python"
import "prismjs/components/prism-swift"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-scss"
import "prismjs/components/prism-json"
import "prismjs/components/prism-yaml"
import "prismjs/components/prism-markdown"

/** The source as HTML: Prism escapes the text and wraps its tokens in spans whose classes name their kind. */
export function highlightSource(source: string, language: string): string {
    return Prism.highlight(source, Prism.languages[language], language)
}
