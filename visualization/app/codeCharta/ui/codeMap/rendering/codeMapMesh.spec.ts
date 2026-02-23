import { Node, CcState } from "../../../codeCharta.model"
import { CodeMapMesh } from "./codeMapMesh"
import { CodeMapBuilding } from "./codeMapBuilding"
import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"
import { InstancedBufferAttribute, InstancedMesh } from "three"

describe("codeMapMesh", () => {
    const testNodes: Node[] = [TEST_NODE_ROOT] // no need for 2 files

    describe("setNewDeltaColor", () => {
        let codeMapBuilding: CodeMapBuilding
        const {
            appSettings: { mapColors }
        } = STATE

        const setFlattened = (isFlat: boolean) => {
            for (const node of testNodes) {
                node.flat = isFlat
            }
        }

        const rebuildMesh = () => {
            const codedMapMesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, true)
            codeMapBuilding = codedMapMesh.getBuildingByPath(TEST_NODE_ROOT.path)
        }

        it("should not set flat color when not flat", () => {
            setFlattened(false)
            rebuildMesh()

            expect(testNodes[0].flat).toBeFalsy()
            expect(codeMapBuilding.deltaColor).not.toEqual(mapColors.flat)
        })

        it("should set flat color when flat", () => {
            setFlattened(true)
            rebuildMesh()

            expect(testNodes[0].flat).toBeTruthy()
            expect(codeMapBuilding.deltaColor).toEqual(mapColors.flat)
        })
    })

    describe("differential highlight", () => {
        it("should use the differential update path on second highlightBuilding call", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const buildings = mesh.getMeshDescription().buildings
            const ids = new Set([buildings[0].id])
            mesh.highlightBuilding(ids, buildings[0], null, STATE, new Map())

            // Spy after the first call so only the second call is tracked
            const updateHighlightedSpy = jest.spyOn(mesh as any, "updateHighlightedBuildings")
            const updateAllSpy = jest.spyOn(mesh as any, "updateAllBuildings")

            // Act — second call with same state should take the differential path
            mesh.highlightBuilding(ids, buildings[0], null, STATE, new Map())

            // Assert — differential helper called, full-rebuild skipped
            expect(updateHighlightedSpy).toHaveBeenCalledTimes(1)
            expect(updateAllSpy).not.toHaveBeenCalled()
        })

        it("should reset _prevHighlightedIds when clearing unselected buildings", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const buildings = mesh.getMeshDescription().buildings
            const ids = new Set([buildings[0].id])
            mesh.highlightBuilding(ids, buildings[0], null, STATE, new Map())

            // Act
            mesh.clearUnselectedBuildings(null)

            // Assert
            expect(mesh["_prevHighlightedIds"]).toBeNull()
        })

        it("should reset _prevIsPresentationMode when clearing unselected buildings", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const buildings = mesh.getMeshDescription().buildings
            mesh.highlightBuilding(new Set([buildings[0].id]), buildings[0], null, STATE, new Map())

            // Act
            mesh.clearUnselectedBuildings(null)

            // Assert
            expect(mesh["_prevIsPresentationMode"]).toBeNull()
        })

        it("should force full re-render when isPresentationMode is toggled mid-hover", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const buildings = mesh.getMeshDescription().buildings
            const ids = new Set([buildings[0].id])

            const stateNormal: CcState = { ...STATE, appSettings: { ...STATE.appSettings, isPresentationMode: false } }
            const statePresentation: CcState = { ...STATE, appSettings: { ...STATE.appSettings, isPresentationMode: true } }

            // First call with presentation mode off — establishes _prevHighlightedIds
            mesh.highlightBuilding(ids, buildings[0], null, stateNormal, new Map())
            expect(mesh["_prevHighlightedIds"]).not.toBeNull()

            // Act: toggle presentation mode on — should force full re-render path by clearing _prevHighlightedIds
            // Spy on updateAllBuildings to confirm it is called (full-render path)
            const updateAllSpy = jest.spyOn(mesh as any, "updateAllBuildings")
            mesh.highlightBuilding(ids, buildings[0], null, statePresentation, new Map())

            // Assert: _prevHighlightedIds was cleared before taking the full path
            expect(updateAllSpy).toHaveBeenCalledTimes(1)
            // After the call, _prevHighlightedIds is re-populated and mode is recorded
            expect(mesh["_prevHighlightedIds"]).toEqual(ids)
            expect(mesh["_prevIsPresentationMode"]).toBe(true)

            updateAllSpy.mockRestore()
        })

        it("should force full re-render when isPresentationMode is toggled off mid-hover", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const buildings = mesh.getMeshDescription().buildings
            const ids = new Set([buildings[0].id])

            const statePresentation: CcState = { ...STATE, appSettings: { ...STATE.appSettings, isPresentationMode: true } }
            const stateNormal: CcState = { ...STATE, appSettings: { ...STATE.appSettings, isPresentationMode: false } }

            // First call in presentation mode
            mesh.highlightBuilding(ids, buildings[0], null, statePresentation, new Map())
            expect(mesh["_prevIsPresentationMode"]).toBe(true)

            // Act: toggle presentation mode off
            const updateAllSpy = jest.spyOn(mesh as any, "updateAllBuildings")
            mesh.highlightBuilding(ids, buildings[0], null, stateNormal, new Map())

            // Assert: full re-render path was taken even though prev exists
            expect(updateAllSpy).toHaveBeenCalledTimes(1)
            expect(mesh["_prevIsPresentationMode"]).toBe(false)

            updateAllSpy.mockRestore()
        })
    })

    describe("InstancedMesh", () => {
        it("should return an InstancedMesh from getThreeMesh", () => {
            // Arrange & Act
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)

            // Assert
            expect(mesh.getThreeMesh()).toBeInstanceOf(InstancedMesh)
        })

        it("should write 1 instance color entry per building instead of 24 vertices", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const colorAttr = mesh.getThreeMesh().geometry.getAttribute("color") as InstancedBufferAttribute

            // Act — highlight changes color
            const buildings = mesh.getMeshDescription().buildings
            mesh.highlightBuilding(new Set([buildings[0].id]), buildings[0], null, STATE, new Map())

            // Assert — instance attribute has 1 entry per building (not 24)
            expect(colorAttr.count).toBe(1)
        })
    })

    describe("selectBuilding / clearSelection", () => {
        it("should apply the given color to a building on selectBuilding", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const building = mesh.getMeshDescription().buildings[0]
            const color = "#aabbcc"

            // Act
            mesh.selectBuilding(building, color)

            // Assert
            expect(building.color).toBe(color)
            expect(building.deltaColor).toBe(color)
        })

        it("should reset color to default on clearSelection", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)
            const building = mesh.getMeshDescription().buildings[0]
            const originalColor = building.color
            mesh.selectBuilding(building, "#aabbcc")

            // Act
            mesh.clearSelection(building)

            // Assert
            expect(building.color).toBe(originalColor)
        })
    })

    describe("setScale", () => {
        it("should delegate to mapGeomDesc without throwing", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)

            // Act & Assert
            expect(() => mesh.setScale({ x: 2, y: 3, z: 1.5 })).not.toThrow()
        })
    })

    describe("getNodes", () => {
        it("should return the nodes passed to the constructor", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)

            // Act & Assert
            expect(mesh.getNodes()).toContain(TEST_NODE_ROOT)
        })
    })

    describe("dispose", () => {
        it("should not throw when disposing mesh and material", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)

            // Act & Assert
            expect(() => mesh.dispose()).not.toThrow()
        })
    })

    describe("toExportMesh", () => {
        it("should return a standard Mesh with expanded per-vertex data", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)

            // Act
            const exportMesh = mesh.toExportMesh()

            // Assert
            expect(exportMesh.geometry.getAttribute("position")).toBeDefined()
            expect(exportMesh.geometry.getAttribute("color")).toBeDefined()
            expect(exportMesh.geometry.index).toBeDefined()
            // 1 building = 24 vertices
            expect(exportMesh.geometry.getAttribute("position").count).toBe(24)
            // 1 building = 30 indices (5 visible faces × 6)
            expect(exportMesh.geometry.index.count).toBe(30)
        })

        it("should expand colors to 24 vertices per building", () => {
            // Arrange
            const mesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, false)

            // Act
            const exportMesh = mesh.toExportMesh()
            const colorAttr = exportMesh.geometry.getAttribute("color")

            // Assert — all 24 vertices should have the same color
            const firstR = colorAttr.getX(0)
            const firstG = colorAttr.getY(0)
            const firstB = colorAttr.getZ(0)
            for (let i = 1; i < 24; i++) {
                expect(colorAttr.getX(i)).toBe(firstR)
                expect(colorAttr.getY(i)).toBe(firstG)
                expect(colorAttr.getZ(i)).toBe(firstB)
            }
        })
    })
})
