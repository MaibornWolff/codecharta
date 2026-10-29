import { sourceLanguageOf } from "./sourceLanguage"

describe("sourceLanguageOf", () => {
    it.each([
        ["src/Main.kt", "kotlin"],
        ["build.gradle.kts", "kotlin"],
        ["src/App.java", "java"],
        ["app/view.component.ts", "typescript"],
        ["app/View.tsx", "tsx"],
        ["lib/index.mjs", "javascript"],
        ["tools/run.py", "python"],
        ["Service.cs", "csharp"],
        ["main.go", "go"],
        ["include/io.h", "c"],
        ["src/engine.cpp", "cpp"],
        ["View.m", "objectivec"],
        ["index.php", "php"],
        ["Rakefile.rake", "ruby"],
        ["App.swift", "swift"],
        ["lib.rs", "rust"],
        ["deploy.sh", "bash"],
        ["schema.sql", "sql"],
        ["page.html", "markup"],
        ["App.vue", "markup"],
        ["theme.scss", "scss"],
        ["config.YML", "yaml"]
    ])("should colour %s as %s", (filePath, grammar) => {
        // Act
        const answer = sourceLanguageOf(filePath)

        // Assert
        expect(answer.grammar).toBe(grammar)
    })

    it.each([
        ["src/Main.kt", "Kotlin"],
        ["Service.cs", "C#"],
        ["src/engine.hpp", "C++"],
        ["App.vue", "Vue"],
        ["orders.p", "ABL"],
        ["src/Makefile", "Plain text"]
    ])("should name the language of %s %s", (filePath, label) => {
        // Act
        const answer = sourceLanguageOf(filePath)

        // Assert
        expect(answer.label).toBe(label)
    })

    it.each([
        ["an ABL program, which Prism has no grammar for", "orders.p"],
        ["a file without an extension", "src/Makefile"],
        ["a hidden file named only by its dot", "app/.gitignore"],
        ["a folder whose name has a dot", "my.app/README"]
    ])("should leave %s plain", (_case, filePath) => {
        // Act
        const answer = sourceLanguageOf(filePath)

        // Assert
        expect(answer.grammar).toBeNull()
    })
})
