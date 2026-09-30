import { dependencyEdgeTypeOf } from "../../../../lenses/dependency/dependencyLens.facade"
import { DEPENDENCY_EDGE_TYPES } from "../../../../model/dependencyGraph.model"
import { sampleFile1 } from "./sampleFiles"
import { mapCcJson2ToCCFile } from "./util/ccJson2/ccJson2ToCCFile"

describe("sampleFiles", () => {
    it("should give the first sample a dependency level on every file and folder below the root", () => {
        // Arrange
        const { content } = sampleFile1

        // Act
        const { dependencyLevels } = mapCcJson2ToCCFile(content, sampleFile1).settings.fileSettings

        // Assert
        expect(Object.keys(dependencyLevels).sort()).toEqual([
            "/root/ParentLeaf",
            "/root/ParentLeaf/otherSmallLeaf.ts",
            "/root/ParentLeaf/smallLeaf.html",
            "/root/bigLeaf.ts",
            "/root/sample1OnlyLeaf.scss"
        ])
    })

    it("should give the first sample an edge of every dependency edge type", () => {
        // Arrange
        const { content } = sampleFile1

        // Act
        const { edges } = mapCcJson2ToCCFile(content, sampleFile1).settings.fileSettings

        // Assert
        expect(new Set(edges.map(edge => dependencyEdgeTypeOf(edge)))).toEqual(new Set(DEPENDENCY_EDGE_TYPES))
    })
})
