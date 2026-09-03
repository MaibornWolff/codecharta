import { WordListGeometry, wordListWindow } from "./wordListWindow"

const ROW_HEIGHT = 28
const OVERSCAN_ROWS = 6

function geometry(overrides: Partial<WordListGeometry> = {}): WordListGeometry {
    return {
        rowCount: 1000,
        rowHeight: ROW_HEIGHT,
        scrolledPast: 0,
        viewportHeight: 280,
        expandedIndex: -1,
        expandedHeight: 0,
        ...overrides
    }
}

describe("wordListWindow", () => {
    it("should render a slice of the rows plus an overscan, not the whole list", () => {
        // Arrange & Act
        const window = wordListWindow(geometry())

        // Assert: ten rows fit, so only those and the overscan below them are rendered.
        expect(window.firstIndex).toBe(0)
        expect(window.lastIndex).toBe(10 + OVERSCAN_ROWS)
    })

    it("should hold the whole list's height in the spacers, so the scrollbar stays honest", () => {
        // Arrange & Act
        const window = wordListWindow(geometry({ scrolledPast: 28 * 100 }))

        // Assert
        const renderedHeight = (window.lastIndex - window.firstIndex + 1) * ROW_HEIGHT
        expect(window.topSpacerHeight + renderedHeight + window.bottomSpacerHeight).toBe(1000 * ROW_HEIGHT)
    })

    it("should move the window down as the list is scrolled", () => {
        // Arrange & Act
        const window = wordListWindow(geometry({ scrolledPast: ROW_HEIGHT * 100 }))

        // Assert
        expect(window.firstIndex).toBe(100 - OVERSCAN_ROWS)
        expect(window.topSpacerHeight).toBe((100 - OVERSCAN_ROWS) * ROW_HEIGHT)
    })

    it("should count an open breakdown above the window into the height above it", () => {
        // Arrange: a breakdown open at the very top, scrolled far past it.
        const expandedHeight = 500

        // Act
        const window = wordListWindow(geometry({ expandedIndex: 0, expandedHeight, scrolledPast: ROW_HEIGHT * 100 + expandedHeight }))

        // Assert: the rows below it keep their place instead of shifting up by the breakdown's height.
        expect(window.firstIndex).toBe(100 - OVERSCAN_ROWS)
        expect(window.topSpacerHeight).toBe((100 - OVERSCAN_ROWS) * ROW_HEIGHT + expandedHeight)
    })

    it("should keep the row an open breakdown belongs to in the window while the breakdown fills it", () => {
        // Arrange: scrolled into the middle of a breakdown that is taller than the viewport.
        const expandedHeight = 2000

        // Act
        const window = wordListWindow(geometry({ expandedIndex: 20, expandedHeight, scrolledPast: ROW_HEIGHT * 21 + 900 }))

        // Assert: its row is still rendered, otherwise the breakdown would vanish mid-scroll.
        expect(window.firstIndex).toBeLessThanOrEqual(20)
        expect(window.lastIndex).toBeGreaterThanOrEqual(20)
    })

    it("should count an open breakdown below the window into the height below it", () => {
        // Arrange & Act
        const expandedHeight = 500
        const window = wordListWindow(geometry({ expandedIndex: 900, expandedHeight }))

        // Assert
        const renderedHeight = (window.lastIndex - window.firstIndex + 1) * ROW_HEIGHT
        expect(window.topSpacerHeight + renderedHeight + window.bottomSpacerHeight).toBe(1000 * ROW_HEIGHT + expandedHeight)
    })

    it("should render everything while the list has not been measured yet", () => {
        // Arrange & Act
        const window = wordListWindow(geometry({ rowCount: 40, viewportHeight: 0 }))

        // Assert
        expect(window.firstIndex).toBe(0)
        expect(window.lastIndex).toBe(39)
        expect(window.topSpacerHeight).toBe(0)
        expect(window.bottomSpacerHeight).toBe(0)
    })

    it("should render nothing but empty spacers for an empty list", () => {
        // Arrange & Act
        const window = wordListWindow(geometry({ rowCount: 0 }))

        // Assert
        expect(window.lastIndex).toBeLessThan(window.firstIndex)
        expect(window.topSpacerHeight).toBe(0)
    })

    it("should stop the window at the last row", () => {
        // Arrange & Act
        const window = wordListWindow(geometry({ rowCount: 12, scrolledPast: 0 }))

        // Assert
        expect(window.lastIndex).toBe(11)
        expect(window.bottomSpacerHeight).toBe(0)
    })
})
