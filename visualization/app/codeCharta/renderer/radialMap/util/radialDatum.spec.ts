import { RadialFolderValue } from "../../../model/codeCharta.model"
import { TEST_COLORING } from "../testing/radialChart.stub"
import { describeNode } from "./radialDatum"
import { RadialNode } from "./radialTree"

const FOLDER: RadialNode = { path: "/root/src", name: "src", isFile: false, area: 30, colorValue: 12, isFlat: false, children: [] }

function coloringWithFolderValue(folderValue: number) {
    return {
        ...TEST_COLORING,
        folders: { ...TEST_COLORING.folders, value: RadialFolderValue.Max, values: new Map([[FOLDER.path, folderValue]]) }
    }
}

describe("describeNode", () => {
    it("should describe a node by its path, area, name and colour value", () => {
        // Act
        const datum = describeNode(FOLDER, TEST_COLORING)

        // Assert
        expect(datum).toEqual({
            name: "/root/src",
            value: 30,
            displayName: "src",
            colorValue: 12,
            folderValueText: undefined,
            isFile: false
        })
    })

    it("should name the folder value a folder is coloured by", () => {
        // Act
        const datum = describeNode(FOLDER, coloringWithFolderValue(7.125))

        // Assert
        expect(datum.folderValueText).toBe("max 7.13")
    })

    it("should give a file no folder value", () => {
        // Act
        const datum = describeNode({ ...FOLDER, isFile: true }, coloringWithFolderValue(7))

        // Assert
        expect(datum.folderValueText).toBeUndefined()
    })
})
