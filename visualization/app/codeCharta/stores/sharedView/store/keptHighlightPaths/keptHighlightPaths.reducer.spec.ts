import { clearKeptHighlight, keepHighlight, removeKeptHighlight } from "./keptHighlightPaths.actions"
import { keptHighlightPaths } from "./keptHighlightPaths.reducer"

describe("keptHighlightPaths", () => {
    it("should add the kept paths once each", () => {
        // Act
        const result = keptHighlightPaths(["/root/a.ts"], keepHighlight({ paths: ["/root/a.ts", "/root/b.ts"] }))

        // Assert
        expect(result).toEqual(["/root/a.ts", "/root/b.ts"])
    })

    it("should remove only the given paths", () => {
        // Act
        const result = keptHighlightPaths(["/root/src", "/root/src/a.ts", "/root/b.ts"], removeKeptHighlight({ paths: ["/root/src/a.ts"] }))

        // Assert
        expect(result).toEqual(["/root/src", "/root/b.ts"])
    })

    it("should clear every kept path", () => {
        // Act
        const result = keptHighlightPaths(["/root/a.ts"], clearKeptHighlight())

        // Assert
        expect(result).toEqual([])
    })
})
