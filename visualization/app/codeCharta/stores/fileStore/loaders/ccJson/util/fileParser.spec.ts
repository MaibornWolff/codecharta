import { klona } from "klona"
import packageJson from "../../../../../../../package.json"
import { TEST_FILE_CONTENT_CC_JSON_2, TEST_FILE_DATA } from "../../../../../mocks/dataMocks"
import { ExportCCFile } from "../../../../../model/codeCharta.api.model"
import { CCFile } from "../../../../../model/codeCharta.model"
import { getCCFile } from "./ccFileHelper"
import { getNameDataPair } from "./fileParser"
import { checkErrors, getAsApiVersion } from "./fileValidator"

describe("fileParser", () => {
    describe("getNameDataPair", () => {
        it("should re-emit a 2.0-origin CCFile as a re-loadable flat 1.x file", () => {
            // Arrange
            const ccFile = getCCFile({ fileName: "sample.cc.json", fileSize: 1234, content: klona(TEST_FILE_CONTENT_CC_JSON_2) })
            expect(ccFile.fileMeta.apiVersion).toBe("2.0")

            // Act
            const content = getNameDataPair(ccFile).content as ExportCCFile

            // Assert
            expect("meta" in content).toBe(false)
            expect(getAsApiVersion(content.apiVersion).major).toBe(1)
            expect(content.apiVersion).toBe(packageJson.codecharta.apiVersion)
            expect(checkErrors(content)).toEqual([])
        })

        it("should preserve the original apiVersion for a genuine 1.x-origin CCFile", () => {
            // Arrange
            const ccFile: CCFile = klona(TEST_FILE_DATA)
            ccFile.fileMeta.apiVersion = "1.2"

            // Act
            const content = getNameDataPair(ccFile).content as ExportCCFile

            // Assert
            expect(content.apiVersion).toBe("1.2")
        })
    })
})
