import { WordListViewport } from "./wordListViewport"

function stubGeometry(element: HTMLElement, { top, height }: { top: number; height: number }) {
    element.getBoundingClientRect = () => ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top }) as DOMRect
    Object.defineProperty(element, "clientHeight", { value: height, configurable: true })
    Object.defineProperty(element, "offsetHeight", { value: height, configurable: true })
}

describe("WordListViewport", () => {
    let scrollHost: HTMLElement
    let list: HTMLElement

    beforeEach(() => {
        scrollHost = document.createElement("div")
        scrollHost.style.overflowY = "auto"
        list = document.createElement("div")
        scrollHost.append(list)
        document.body.append(scrollHost)
    })

    afterEach(() => {
        scrollHost.remove()
    })

    it("should measure how far the list has scrolled past the top of its panel", () => {
        // Arrange: the list's top sits 400px above the panel's top.
        stubGeometry(scrollHost, { top: 100, height: 500 })
        stubGeometry(list, { top: -300, height: 4000 })
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list)

        // Assert
        expect(viewport.geometry().scrolledPast).toBe(400)
        expect(viewport.geometry().viewportHeight).toBe(500)
    })

    it("should report nothing scrolled past while the list starts below the top of its panel", () => {
        // Arrange
        stubGeometry(scrollHost, { top: 100, height: 500 })
        stubGeometry(list, { top: 140, height: 200 })
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list)

        // Assert
        expect(viewport.geometry().scrolledPast).toBe(0)
    })

    it("should take the row height from a rendered row, so a restyled row does not misplace the window", () => {
        // Arrange
        stubGeometry(scrollHost, { top: 0, height: 500 })
        stubGeometry(list, { top: 0, height: 4000 })
        const row = document.createElement("cc-domain-word-row")
        Object.defineProperty(row, "offsetHeight", { value: 42, configurable: true })
        list.append(row)
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list)

        // Assert
        expect(viewport.geometry().rowHeight).toBe(42)
    })

    it("should measure the open breakdown, which sits between its row and the next one", () => {
        // Arrange
        stubGeometry(scrollHost, { top: 0, height: 500 })
        stubGeometry(list, { top: 0, height: 4000 })
        const breakdown = document.createElement("div")
        breakdown.setAttribute("data-word-breakdown", "")
        Object.defineProperty(breakdown, "offsetHeight", { value: 360, configurable: true })
        list.append(breakdown)
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list)

        // Assert
        expect(viewport.geometry().expandedHeight).toBe(360)
    })

    it("should scroll the panel to an offset within the list, so an unrendered row can be reached", () => {
        // Arrange
        stubGeometry(scrollHost, { top: 100, height: 500 })
        stubGeometry(list, { top: 100, height: 4000 })
        scrollHost.scrollTop = 0
        const viewport = new WordListViewport()
        viewport.attachTo(list)

        // Act
        viewport.scrollTo(1200)

        // Assert
        expect(scrollHost.scrollTop).toBe(1200)
    })

    it("should stop measuring once it is disposed", () => {
        // Arrange
        stubGeometry(scrollHost, { top: 0, height: 500 })
        stubGeometry(list, { top: 0, height: 4000 })
        const viewport = new WordListViewport()
        viewport.attachTo(list)
        const measuredBeforeDisposing = viewport.geometry()

        // Act
        viewport.dispose()
        stubGeometry(scrollHost, { top: 0, height: 999 })
        viewport.measure()

        // Assert
        expect(viewport.geometry()).toBe(measuredBeforeDisposing)
    })
})
