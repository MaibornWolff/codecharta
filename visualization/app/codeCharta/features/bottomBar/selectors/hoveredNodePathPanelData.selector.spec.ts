import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { AccumulatedData } from "../../../renderer/renderModel/accumulatedData/accumulatedData.selector"
import { _getHoveredNodePathPanelData, selectedNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"

describe("hoveredNodePathPanelDataSelector", () => {
    it("should return undefined when there is no hovered node", () => {
        expect(_getHoveredNodePathPanelData()).toBe(undefined)
    })

    it("should return correct data for a file", () => {
        expect(
            _getHoveredNodePathPanelData({
                path: "/root/a.ts",
                type: NodeType.FILE
            })
        ).toEqual({ path: ["root", "a.ts"], isFile: true })
    })

    it("should return correct data for a folder", () => {
        expect(
            _getHoveredNodePathPanelData({
                path: "/root",
                type: NodeType.FOLDER
            })
        ).toEqual({ path: ["root"], isFile: false })
    })
})

describe("selectedNodePathPanelDataSelector", () => {
    const mapRoot = { path: "/root", type: NodeType.FOLDER } as CodeMapNode
    const accumulatedData = { unifiedMapNode: mapRoot, unifiedFileMeta: undefined } as AccumulatedData

    it("should return the selected node's path when a node is selected", () => {
        // Arrange
        const selectedNode = { path: "/root/a.ts", type: NodeType.FILE } as CodeMapNode

        // Act
        const panelData = selectedNodePathPanelDataSelector.projector(selectedNode, accumulatedData)

        // Assert
        expect(panelData).toEqual({ path: ["root", "a.ts"], isFile: true })
    })

    it("should fall back to the map root when no node is selected", () => {
        // Arrange & Act
        const panelData = selectedNodePathPanelDataSelector.projector(undefined, accumulatedData)

        // Assert
        expect(panelData).toEqual({ path: ["root"], isFile: false })
    })

    it("should return undefined when no node is selected and no map is loaded", () => {
        // Arrange & Act
        const panelData = selectedNodePathPanelDataSelector.projector(undefined, {
            unifiedMapNode: undefined,
            unifiedFileMeta: undefined
        } as AccumulatedData)

        // Assert
        expect(panelData).toBe(undefined)
    })
})
