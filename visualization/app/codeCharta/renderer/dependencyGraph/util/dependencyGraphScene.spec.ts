import { nestingOf } from "./boxNesting"
import { isEdgeInFocus, isEdgeOfHovered, searchMatcher } from "./dependencyGraphScene"
import { aBox, anEdge } from "./dependencyGraphTestData"
import { LayoutBox } from "./levelizedLayout"

const NO_BOXES: LayoutBox[] = []

describe("searchMatcher", () => {
    it("should count every box as found while no search is on", () => {
        // Arrange
        const noSearch = null

        // Act
        const isFound = searchMatcher(noSearch, NO_BOXES)

        // Assert
        expect(isFound("/root/a.ts")).toBe(true)
    })

    it("should find a box the search found, and the folders holding it", () => {
        // Arrange
        const searchedPaths = new Set(["/root/app/a.ts"])

        // Act
        const isFound = searchMatcher(searchedPaths, NO_BOXES)

        // Assert
        expect(["/root", "/root/app", "/root/app/a.ts", "/root/app/b.ts", "/root/lib"].map(isFound)).toEqual([
            true,
            true,
            true,
            false,
            false
        ])
    })

    it("should find every box inside a folder the search found", () => {
        // Arrange
        const searchedPaths = new Set(["/root/app"])

        // Act
        const isFound = searchMatcher(searchedPaths, NO_BOXES)

        // Assert
        expect(["/root/app/deep/a.ts", "/root/application.ts"].map(isFound)).toEqual([true, false])
    })

    it("should not find the folder a found file's path names when the file is drawn in a package instead", () => {
        // Arrange
        const boxes = [
            aBox("/root", { parentPath: null }),
            aBox("/root/src", { parentPath: "/root" }),
            aBox("package:game", { parentPath: "/root" }),
            aBox("/root/src/creature.ts", { parentPath: "package:game" })
        ]

        // Act
        const isFound = searchMatcher(new Set(["/root/src/creature.ts"]), boxes)

        // Assert
        expect(["/root", "package:game", "/root/src"].map(isFound)).toEqual([true, true, false])
    })

    it("should find the boxes around a found one that hold it without its path saying so, as a package holds a file", () => {
        // Arrange
        const boxes = [
            aBox("/root", { parentPath: null }),
            aBox("package:game", { parentPath: "/root" }),
            aBox("package:game.model", { parentPath: "package:game" }),
            aBox("/root/src/creature.ts", { parentPath: "package:game.model" }),
            aBox("package:util", { parentPath: "/root" })
        ]

        // Act
        const isFound = searchMatcher(new Set(["/root/src/creature.ts"]), boxes)

        // Assert
        expect(["package:game.model", "package:game", "package:util"].map(isFound)).toEqual([true, true, false])
    })
})

describe("isEdgeOfHovered", () => {
    const boxes = [
        aBox("/root", { parentPath: null }),
        aBox("/root/app"),
        aBox("/root/app/a.ts"),
        aBox("/root/app/b.ts"),
        aBox("/root/c.ts")
    ]
    const isInside = nestingOf(boxes)

    it("should count the edges crossing the hovered box's border, not those staying inside or outside it", () => {
        // Arrange
        const crossing = anEdge("/root/app/a.ts", "/root/c.ts")
        const inside = anEdge("/root/app/a.ts", "/root/app/b.ts")

        // Act
        const answers = [crossing, inside].map(edge => isEdgeOfHovered(edge, "/root/app", isInside))

        // Assert
        expect(answers).toEqual([true, false])
        expect(isEdgeOfHovered(crossing, null, isInside)).toBe(false)
    })
})

describe("isEdgeInFocus", () => {
    it("should count the selected edge and the edges pointed at", () => {
        // Arrange
        const focus = { selectedEdgeId: "/root/a|/root/b", highlightedEdgeIds: new Set(["/root/c|/root/d"]) }

        // Act
        const answers = [anEdge("/root/a", "/root/b"), anEdge("/root/c", "/root/d"), anEdge("/root/e", "/root/f")].map(edge =>
            isEdgeInFocus(edge, focus)
        )

        // Assert
        expect(answers).toEqual([true, true, false])
    })
})
