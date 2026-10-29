import { highlightSource } from "./syntaxHighlighter"

describe("highlightSource", () => {
    it("should mark the tokens of a language with classes naming their kind", () => {
        // Act
        const html = highlightSource('fun greet() = "hi"', "kotlin")

        // Assert
        expect(html).toContain('<span class="token keyword">fun</span>')
        expect(html).toContain('<span class="token string">"hi"</span>')
    })

    it("should escape markup in the source, so that a file can never add elements to the page", () => {
        // Act
        const html = highlightSource('const tag = "<img src=x onerror=alert(1)>"', "typescript")

        // Assert
        expect(html).not.toContain("<img")
        expect(html).toContain("&lt;img src=x onerror=alert(1)>")
    })

    it.each([
        "kotlin",
        "java",
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "python",
        "csharp",
        "go",
        "c",
        "cpp",
        "objectivec",
        "php",
        "ruby",
        "swift",
        "rust",
        "bash",
        "sql",
        "markup",
        "css",
        "scss",
        "json",
        "yaml",
        "markdown"
    ])("should know the grammar of %s", language => {
        // Act
        const html = highlightSource("x", language)

        // Assert
        expect(html).toBe("x")
    })

    it("should leave the colouring to CodeCharta instead of colouring the page by itself", () => {
        // Act
        const prism = (globalThis as unknown as { Prism: { manual: boolean; disableWorkerMessageHandler: boolean } }).Prism

        // Assert
        expect(prism.manual).toBe(true)
        expect(prism.disableWorkerMessageHandler).toBe(true)
    })
})
