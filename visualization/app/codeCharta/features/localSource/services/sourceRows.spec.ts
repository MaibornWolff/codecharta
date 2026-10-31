import { highlightedRowsHtml, lineCountOf, plainRowsHtml } from "./sourceRows"

function rowsOf(html: string): HTMLElement[] {
    const container = document.createElement("div")
    container.innerHTML = html
    return [...container.querySelectorAll<HTMLElement>(".cc-source-row")]
}

describe("sourceRows", () => {
    it("should number one row per line, without a row after a closing line break", () => {
        // Act
        const rows = rowsOf(plainRowsHtml("first\nsecond\n"))

        // Assert
        expect(rows.map(row => row.querySelector(".cc-source-number").textContent)).toEqual(["1", "2"])
        expect(rows.map(row => row.querySelector(".cc-source-code").textContent)).toEqual(["first", "second"])
        expect(lineCountOf("first\nsecond\n")).toBe(2)
    })

    it("should show an empty file as one empty line", () => {
        // Act
        const rows = rowsOf(plainRowsHtml(""))

        // Assert
        expect(rows).toHaveLength(1)
        expect(lineCountOf("")).toBe(1)
    })

    it("should escape markup in a plain file, so that a file can never add elements to the page", () => {
        // Act
        const html = plainRowsHtml('<img src=x onerror="alert(1)"> & more')

        // Assert
        expect(html).not.toContain("<img")
        expect(rowsOf(html)[0].querySelector(".cc-source-code").textContent).toBe('<img src=x onerror="alert(1)"> & more')
    })

    it("should close a token spanning lines at each line's end and open it again on the next", () => {
        // Arrange
        const highlighted = 'a <span class="token comment">/* one\ntwo */</span> b'

        // Act
        const rows = rowsOf(highlightedRowsHtml(highlighted))

        // Assert
        expect(rows.map(row => row.querySelector(".cc-source-code").innerHTML)).toEqual([
            'a <span class="token comment">/* one</span>',
            '<span class="token comment">two */</span> b'
        ])
    })

    it("should keep nested tokens across lines", () => {
        // Arrange
        const highlighted = '<span class="token template-string"><span class="token string">`one\ntwo`</span></span>'

        // Act
        const rows = rowsOf(highlightedRowsHtml(highlighted))

        // Assert
        expect(rows[1].querySelector(".cc-source-code").innerHTML).toBe(
            '<span class="token template-string"><span class="token string">two`</span></span>'
        )
    })

    it("should draw rows in blocks of 500, which the browser skips while they are out of view", () => {
        // Act
        const html = plainRowsHtml("line\n".repeat(1001))
        const container = document.createElement("div")
        container.innerHTML = html

        // Assert
        expect([...container.querySelectorAll(".cc-source-block")].map(block => block.children.length)).toEqual([500, 500, 1])
    })
})
