import { areMultipleMapsVisibleSelector } from "./areMultipleMapsVisible.selector"
import { FileSelectionState, FileState } from "../../model/files/files"
import { FILE_STATES, FILE_STATES_TWO_FILES, TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../util/dataMocks"

describe("areMultipleMapsVisibleSelector", () => {
    it("should be true when more than one map is selected in standard mode", () => {
        // Arrange
        const visibleFileStates = FILE_STATES_TWO_FILES

        // Act
        const result = areMultipleMapsVisibleSelector.projector(visibleFileStates)

        // Assert
        expect(result).toBe(true)
    })

    it("should be false when only one map is selected", () => {
        // Arrange
        const visibleFileStates = FILE_STATES

        // Act
        const result = areMultipleMapsVisibleSelector.projector(visibleFileStates)

        // Assert
        expect(result).toBe(false)
    })

    it("should be false in delta mode", () => {
        // Arrange
        const visibleFileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Comparison }
        ]

        // Act
        const result = areMultipleMapsVisibleSelector.projector(visibleFileStates)

        // Assert
        expect(result).toBe(false)
    })
})
