import { TEST_FILE_DATA } from "../../../mocks/dataMocks"
import { CCFile, CcState, DependencyLevelData, Edge, FileSelectionState, FileState } from "../../../model/codeCharta.model"
import { clone } from "../../../util/clone"
import {
    dependencyLevelsSelector,
    hasDependencyDataSelector,
    isLoadedFileSetWithoutDependencyLensSelector,
    pathsWithDependencyLevelsSelector
} from "./dependencyLevels.selector"

describe("dependency lens levels", () => {
    function fileWith(name: string, dependencyLevels: DependencyLevelData, edges?: Edge[]): CCFile {
        const file = clone(TEST_FILE_DATA)
        file.fileMeta.fileName = name
        file.settings.fileSettings.dependencyLevels = dependencyLevels
        file.settings.fileSettings.edges = edges ?? file.settings.fileSettings.edges
        return file
    }

    function fileState(file: CCFile, selectedAs: FileSelectionState): FileState {
        return { file, selectedAs }
    }

    describe("dependencyLevelsSelector", () => {
        it("should return the single visible file's levels unchanged", () => {
            // Arrange
            const levels = { "/root/app": 1, "/root/app/a.ts": 0 }
            const files = [fileState(fileWith("single", levels), FileSelectionState.Partial)]

            // Act
            const derived = dependencyLevelsSelector.projector(files)

            // Assert
            expect(derived).toBe(levels)
        })

        it("should prefix each path with its file name when multiple partial files are visible", () => {
            // Arrange
            const files = [
                fileState(fileWith("first", { "/root/a.ts": 2 }), FileSelectionState.Partial),
                fileState(fileWith("second", { "/root/b.ts": 1 }), FileSelectionState.Partial)
            ]

            // Act
            const derived = dependencyLevelsSelector.projector(files)

            // Assert
            expect(derived).toEqual({ "/root/first/a.ts": 2, "/root/second/b.ts": 1 })
        })

        it("should union the levels unprefixed when the files are compared", () => {
            // Arrange
            const files = [
                fileState(fileWith("reference", { "/root/a.ts": 2 }), FileSelectionState.Reference),
                fileState(fileWith("comparison", { "/root/b.ts": 1 }), FileSelectionState.Comparison)
            ]

            // Act
            const derived = dependencyLevelsSelector.projector(files)

            // Assert
            expect(derived).toEqual({ "/root/a.ts": 2, "/root/b.ts": 1 })
        })

        it("should read a file persisted before the lens had levels as carrying none", () => {
            // Arrange
            const file = fileWith("old", {})
            delete file.settings.fileSettings.dependencyLevels
            const files = [
                fileState(file, FileSelectionState.Partial),
                fileState(fileWith("new", { "/root/a.ts": 0 }), FileSelectionState.Partial)
            ]

            // Act
            const derived = dependencyLevelsSelector.projector(files)

            // Assert
            expect(derived).toEqual({ "/root/new/a.ts": 0 })
        })

        it("should return no levels when no file is visible", () => {
            // Arrange
            const files: FileState[] = []

            // Act
            const derived = dependencyLevelsSelector.projector(files)

            // Assert
            expect(derived).toEqual({})
        })
    })

    describe("hasDependencyDataSelector", () => {
        it("should be true when the visible files carry levels and an edge metric", () => {
            // Arrange
            const files = [fileState(fileWith("analysed", { "/root/a.ts": 0 }), FileSelectionState.Partial)]

            // Act
            const hasData = hasDependencyDataSelector.projector(files)

            // Assert
            expect(hasData).toBe(true)
        })

        it("should be false when no visible file carries levels", () => {
            // Arrange
            const files = [fileState(fileWith("plain", {}), FileSelectionState.Partial)]

            // Act
            const hasData = hasDependencyDataSelector.projector(files)

            // Assert
            expect(hasData).toBe(false)
        })

        it("should be false when the visible files carry levels but no edges", () => {
            // Arrange
            const files = [fileState(fileWith("withoutEdges", { "/root/a.ts": 0 }, []), FileSelectionState.Partial)]

            // Act
            const hasData = hasDependencyDataSelector.projector(files)

            // Assert
            expect(hasData).toBe(false)
        })

        it("should be false when the visible files carry levels and edges without an edge metric", () => {
            // Arrange
            const edgeWithoutMetric: Edge = { fromNodeName: "/root/a.ts", toNodeName: "/root/b.ts", attributes: {} }
            const files = [fileState(fileWith("withoutMetric", { "/root/a.ts": 0 }, [edgeWithoutMetric]), FileSelectionState.Partial)]

            // Act
            const hasData = hasDependencyDataSelector.projector(files)

            // Assert
            expect(hasData).toBe(false)
        })
    })

    describe("isLoadedFileSetWithoutDependencyLensSelector", () => {
        it("should be true when every visible file lacks levels", () => {
            // Arrange
            const state = { files: [fileState(fileWith("plain", {}), FileSelectionState.Partial)] } as CcState

            // Act
            const isWithout = isLoadedFileSetWithoutDependencyLensSelector(state)

            // Assert
            expect(isWithout).toBe(true)
        })

        it("should be false when one visible file carries levels", () => {
            // Arrange
            const state = {
                files: [
                    fileState(fileWith("plain", {}), FileSelectionState.Partial),
                    fileState(fileWith("analysed", { "/root/a.ts": 0 }), FileSelectionState.Partial)
                ]
            } as CcState

            // Act
            const isWithout = isLoadedFileSetWithoutDependencyLensSelector(state)

            // Assert
            expect(isWithout).toBe(false)
        })

        it("should be true when the visible files carry levels but no edge metric", () => {
            // Arrange
            const state = { files: [fileState(fileWith("withoutEdges", { "/root/a.ts": 0 }, []), FileSelectionState.Partial)] } as CcState

            // Act
            const isWithout = isLoadedFileSetWithoutDependencyLensSelector(state)

            // Assert
            expect(isWithout).toBe(true)
        })

        it("should be false when one visible file carries levels and another the edge metrics", () => {
            // Arrange
            const state = {
                files: [
                    fileState(fileWith("levelsOnly", { "/root/a.ts": 0 }, []), FileSelectionState.Partial),
                    fileState(fileWith("edgesOnly", {}), FileSelectionState.Partial)
                ]
            } as CcState

            // Act
            const isWithout = isLoadedFileSetWithoutDependencyLensSelector(state)

            // Assert
            expect(isWithout).toBe(false)
        })

        it("should be false before any file is loaded", () => {
            // Arrange
            const state = { files: [] } as CcState

            // Act
            const isWithout = isLoadedFileSetWithoutDependencyLensSelector(state)

            // Assert
            expect(isWithout).toBe(false)
        })
    })

    describe("pathsWithDependencyLevelsSelector", () => {
        it("should name every node carrying a level and every folder holding one", () => {
            // Arrange
            const levels = { "/root/app/ui/view.ts": 1, "/root/app/model.ts": 0 }

            // Act
            const paths = pathsWithDependencyLevelsSelector.projector(levels)

            // Assert
            expect([...paths].sort()).toEqual(["/root", "/root/app", "/root/app/model.ts", "/root/app/ui", "/root/app/ui/view.ts"])
        })
    })
})
