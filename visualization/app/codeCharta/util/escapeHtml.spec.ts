import { escapeHtml } from "./escapeHtml"

describe("escapeHtml", () => {
    it("should escape every character that HTML would interpret", () => {
        // Act
        const escaped = escapeHtml(`<a href="x">Tom & Jerry's</a>`)

        // Assert
        expect(escaped).toBe("&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;")
    })
})
