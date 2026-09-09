import { WordListViewport } from "./wordListViewport"

function stubGeometry(element: HTMLElement, { top, height }: { top: number; height: number }) {
    element.getBoundingClientRect = () => ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top }) as DOMRect
    Object.defineProperty(element, "clientHeight", { value: height, configurable: true })
    Object.defineProperty(element, "offsetHeight", { value: height, configurable: true })
}

function elementOfHeight(tagName: string, height: number, attribute?: string): HTMLElement {
    const element = document.createElement(tagName)
    Object.defineProperty(element, "offsetHeight", { value: height, configurable: true })
    if (attribute) {
        element.setAttribute(attribute, "")
    }
    return element
}

describe("WordListViewport", () => {
    let panel: HTMLElement
    let list: HTMLElement

    beforeEach(() => {
        panel = document.createElement("div")
        list = document.createElement("div")
        panel.append(list)
        document.body.append(panel)
        stubGeometry(panel, { top: 100, height: 500 })
        stubGeometry(list, { top: 100, height: 4000 })
    })

    afterEach(() => {
        panel.remove()
    })

    it("should measure how far the list has scrolled past the top of its panel", () => {
        // Arrange: the list's top sits 400px above the panel's top.
        stubGeometry(list, { top: -300, height: 4000 })
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list, panel)

        // Assert
        expect(viewport.geometry().scrolledPast).toBe(400)
        expect(viewport.geometry().viewportHeight).toBe(500)
    })

    it("should report nothing scrolled past while the list starts below the top of its panel", () => {
        // Arrange
        stubGeometry(list, { top: 140, height: 200 })
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list, panel)

        // Assert
        expect(viewport.geometry().scrolledPast).toBe(0)
    })

    it("should stay unmeasured while the explorer has no panel, so every row is rendered", () => {
        // Arrange: the panel does not exist while the explorer browses files or sits collapsed.
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list, null)

        // Assert
        expect(viewport.geometry().viewportHeight).toBe(0)
    })

    it("should measure the panel the explorer creates after the list, not only one that was there first", () => {
        // Arrange: the list is built while the explorer is on its file tree, so it starts without a panel.
        const viewport = new WordListViewport()
        viewport.attachTo(list, null)

        // Act: switching to word mode creates the panel and hands it over.
        viewport.attachTo(list, panel)

        // Assert
        expect(viewport.geometry().viewportHeight).toBe(500)
    })

    it("should move to the panel the explorer re-creates, instead of measuring the destroyed one", () => {
        // Arrange: collapsing and re-opening the sidebar replaces the panel element.
        const viewport = new WordListViewport()
        viewport.attachTo(list, panel)
        const reopenedPanel = document.createElement("div")
        stubGeometry(reopenedPanel, { top: 100, height: 800 })
        reopenedPanel.append(list)

        // Act
        viewport.attachTo(list, reopenedPanel)

        // Assert
        expect(viewport.geometry().viewportHeight).toBe(800)
    })

    it("should stay unmeasured while the list is not inside the panel, so the file tree is left alone", () => {
        // Arrange: browsing files leaves this list built but outside the panel the tree scrolls in.
        list.remove()
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list, panel)

        // Assert
        expect(viewport.geometry().viewportHeight).toBe(0)
    })

    it("should take the row height from a rendered row, so a restyled row does not misplace the window", () => {
        // Arrange
        list.append(elementOfHeight("cc-domain-word-row", 42))
        const viewport = new WordListViewport()

        // Act
        viewport.attachTo(list, panel)

        // Assert
        expect(viewport.geometry().rowHeight).toBe(42)
    })

    it("should stop measuring once it is disposed", () => {
        // Arrange
        const viewport = new WordListViewport()
        viewport.attachTo(list, panel)
        const measuredBeforeDisposing = viewport.geometry()

        // Act
        viewport.dispose()
        stubGeometry(panel, { top: 0, height: 999 })
        viewport.measure()

        // Assert
        expect(viewport.geometry()).toBe(measuredBeforeDisposing)
    })
})
