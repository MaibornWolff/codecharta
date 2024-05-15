import { NodeType } from "../../../codeCharta.model"
import { _getHoveredNodePathPanelData } from "./hoveredNodePathPanelData.selector"

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
