import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { visibleRepresentatives } from "./edgeProjection"
import { LeveledNode } from "./leveledTree"
import { findUpwardMarks, NO_UPWARD_MARKS } from "./upwardMarks"

const FOLDER = "/root/app"
const FIRST_FILE = "/root/app/a.ts"
const SECOND_FILE = "/root/app/b.ts"
const FILE_ELSEWHERE = "/root/lib/c.ts"

function fileDeclaring(path: string, names: string[]): LeveledNode {
    const declarations = names.map(
        (name): LeveledNode => ({ path: `${path}/${name}`, name, level: 0, kind: "declaration", children: [], declarationKind: "class" })
    )
    return { path, name: path.split("/").pop(), level: 0, kind: "file", children: declarations }
}

function folder(path: string, children: LeveledNode[]): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "folder", children }
}

const TREE = folder("/root", [
    folder(FOLDER, [fileDeclaring(FIRST_FILE, ["One", "Inner"]), fileDeclaring(SECOND_FILE, ["Two"])]),
    folder("/root/lib", [fileDeclaring(FILE_ELSEWHERE, ["Far"])])
])

function declarationEdge(from: string, to: string, isPointingUpwards = true): DependencyLeafEdge {
    const [fromNodeName, fromLeaf] = from.split("#")
    const [toNodeName, toLeaf] = to.split("#")
    return { fromNodeName, fromLeaf, toNodeName, toLeaf, attributes: { dependencies: 1 }, usage: ["usage"], isPointingUpwards }
}

const WITHIN_THE_FIRST_FILE = declarationEdge(`${FIRST_FILE}#Inner`, `${FIRST_FILE}#One`)
const BETWEEN_THE_FILES = declarationEdge(`${FIRST_FILE}#One`, `${SECOND_FILE}#Two`)
const OUT_OF_THE_FOLDER = declarationEdge(`${SECOND_FILE}#Two`, `${FILE_ELSEWHERE}#Far`)
const DOWNWARD_WITHIN_THE_FIRST_FILE = declarationEdge(`${FIRST_FILE}#One`, `${FIRST_FILE}#Inner`, false)
const EDGES = [WITHIN_THE_FIRST_FILE, BETWEEN_THE_FILES, OUT_OF_THE_FOLDER, DOWNWARD_WITHIN_THE_FIRST_FILE]

const byOwnFlag = (edge: DependencyLeafEdge) => Boolean(edge.isPointingUpwards)

describe("findUpwardMarks", () => {
    it("should count on a closed file the upward dependencies between its own declarations alone", () => {
        // Arrange
        const everyFileClosed = visibleRepresentatives(TREE, new Set(["/root", FOLDER, "/root/lib"]))

        // Act
        const upwardMarks = findUpwardMarks(EDGES, everyFileClosed, byOwnFlag)

        // Assert
        expect([...upwardMarks]).toEqual([[FIRST_FILE, 1]])
    })

    it("should count on a closed folder the upward dependencies between its files and inside them, not those leaving it", () => {
        // Arrange
        const folderClosed = visibleRepresentatives(TREE, new Set(["/root"]))

        // Act
        const upwardMarks = findUpwardMarks(EDGES, folderClosed, byOwnFlag)

        // Assert
        expect([...upwardMarks]).toEqual([[FOLDER, 2]])
    })

    it("should count nothing in an opened file, whose declarations show their dependencies themselves", () => {
        // Arrange
        const firstFileOpened = visibleRepresentatives(TREE, new Set(["/root", FOLDER, FIRST_FILE]))

        // Act
        const upwardMarks = findUpwardMarks(EDGES, firstFileOpened, byOwnFlag)

        // Assert
        expect(upwardMarks).toEqual(NO_UPWARD_MARKS)
    })

    it("should ask the upward rule which way a dependency points instead of its own flag", () => {
        // Arrange
        const folderClosed = visibleRepresentatives(TREE, new Set(["/root"]))
        const nothingPointsUpward = () => false

        // Act
        const upwardMarks = findUpwardMarks(EDGES, folderClosed, nothingPointsUpward)

        // Assert
        expect(upwardMarks).toEqual(NO_UPWARD_MARKS)
    })
})
