import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { mapFlattenPredicateSelector } from "./mapFlattenPredicate.selector"

function file(path: string): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FILE, attributes: {} }
}

function folder(path: string): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FOLDER, attributes: {}, children: [] }
}

const NO_RULES = () => false
const HITS = new Set(["/root/src/app/a.ts"])

describe("mapFlattenPredicateSelector", () => {
    it("should flatten only what the rules flatten when nothing is searched", () => {
        // Arrange
        const rules = (node: CodeMapNode) => node.path === "/root/b.ts"

        // Act
        const isFlat = mapFlattenPredicateSelector.projector(rules, "", new Set())

        // Assert
        expect(isFlat(file("/root/b.ts"))).toBe(true)
        expect(isFlat(file("/root/c.ts"))).toBe(false)
    })

    it("should flatten a file the search misses", () => {
        // Act
        const isFlat = mapFlattenPredicateSelector.projector(NO_RULES, "a.ts", HITS)

        // Assert
        expect(isFlat(file("/root/b.ts"))).toBe(true)
        expect(isFlat(file("/root/src/app/a.ts"))).toBe(false)
    })

    it("should keep a folder with a hit inside and flatten one without", () => {
        // Act
        const isFlat = mapFlattenPredicateSelector.projector(NO_RULES, "a.ts", HITS)

        // Assert
        expect(isFlat(folder("/root"))).toBe(false)
        expect(isFlat(folder("/root/src"))).toBe(false)
        expect(isFlat(folder("/root/src/app"))).toBe(false)
        expect(isFlat(folder("/root/src/application"))).toBe(true)
        expect(isFlat(folder("/root/test"))).toBe(true)
    })

    it("should keep a folder the search hits itself", () => {
        // Act
        const isFlat = mapFlattenPredicateSelector.projector(NO_RULES, "test", new Set(["/root/test"]))

        // Assert
        expect(isFlat(folder("/root/test"))).toBe(false)
    })

    it("should flatten everything when the search hits nothing", () => {
        // Act
        const isFlat = mapFlattenPredicateSelector.projector(NO_RULES, "nothing", new Set())

        // Assert
        expect(isFlat(folder("/root"))).toBe(true)
        expect(isFlat(file("/root/b.ts"))).toBe(true)
    })

    it("should keep a search hit flat when the rules flatten it", () => {
        // Arrange
        const rules = (node: CodeMapNode) => node.path === "/root/src/app/a.ts"

        // Act
        const isFlat = mapFlattenPredicateSelector.projector(rules, "a.ts", HITS)

        // Assert
        expect(isFlat(file("/root/src/app/a.ts"))).toBe(true)
    })
})
