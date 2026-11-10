import { CCFile, FileSelectionState, FileState, SecurityData } from "../../../model/codeCharta.model"
import { shopSecurity } from "../../../util/security/security.mocks"
import { _visibleSecurity } from "./security.selector"

function fileStateOf(fileName: string, selectedAs: FileSelectionState, security?: SecurityData): FileState {
    const file = { fileMeta: { fileName }, settings: { fileSettings: { security } } } as unknown as CCFile
    return { file, selectedAs }
}

describe("_visibleSecurity", () => {
    it("should give the one map's packages as they are", () => {
        // Arrange
        const security = shopSecurity()

        // Act
        const visible = _visibleSecurity([fileStateOf("shop", FileSelectionState.Partial, security)])

        // Assert
        expect(visible).toBe(security)
    })

    it("should move each map's files under its folder when several maps are shown side by side", () => {
        // Arrange
        const fileStates = [
            fileStateOf("shop", FileSelectionState.Partial, shopSecurity()),
            fileStateOf("admin", FileSelectionState.Partial, shopSecurity())
        ]

        // Act
        const visible = _visibleSecurity(fileStates)

        // Assert
        expect(Object.keys(visible.lockfiles).sort()).toEqual(["/root/admin/package-lock.json", "/root/shop/package-lock.json"])
    })

    it("should give the packages of the newer map in compare mode", () => {
        // Arrange
        const newer = shopSecurity({ vulnerabilitySources: ["grype"] })
        const fileStates = [
            fileStateOf("before", FileSelectionState.Reference, shopSecurity()),
            fileStateOf("after", FileSelectionState.Comparison, newer)
        ]

        // Act
        const visible = _visibleSecurity(fileStates)

        // Assert
        expect(visible).toBe(newer)
    })

    it("should give nothing when no map carries a security lens", () => {
        // Arrange
        const fileStates = [fileStateOf("shop", FileSelectionState.Partial)]

        // Act
        const visible = _visibleSecurity(fileStates)

        // Assert
        expect(visible).toBeUndefined()
    })
})
