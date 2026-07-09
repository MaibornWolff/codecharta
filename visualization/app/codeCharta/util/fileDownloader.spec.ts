import { klona } from "klona"
import { stubDate } from "../../../mocks/dateMock.helper"
import packageJson from "../../../package.json"
import {
    TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED,
    TEST_ATTRIBUTE_TYPES,
    TEST_FILE_DATA,
    TEST_FILE_DATA_DOWNLOADED,
    VALID_EDGES_DECORATED,
    VALID_NODE_DECORATED
} from "../mocks/dataMocks"
import { BlacklistItem, CodeMapNode, FileMeta, FileSettings, MarkedPackage, MetricsLensSource } from "../model/codeCharta.model"
import { checkErrors, ERROR_MESSAGES } from "../stores/fileStore/loaders/ccJson/util/fileValidator"
import { DownloadableSetting, FileDownloader } from "./fileDownloader"

describe("fileDownloader", () => {
    let map: CodeMapNode
    let fileMeta: FileMeta
    let filesettings: FileSettings & MetricsLensSource & { blacklist: BlacklistItem[]; markedPackages: MarkedPackage[] }
    let fileName: string
    let fileNameWithExtension: string
    let downloadSettings: DownloadableSetting[]
    stubDate(new Date("2018-12-14T09:39:59"))

    beforeEach(() => {
        map = VALID_NODE_DECORATED
        fileMeta = TEST_FILE_DATA.fileMeta
        filesettings = TEST_FILE_DATA.settings.fileSettings
        filesettings.edges = VALID_EDGES_DECORATED
        filesettings.attributeTypes = TEST_ATTRIBUTE_TYPES
        filesettings.attributeDescriptors = TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED
        filesettings.blacklist = [
            { path: "/root/bigLeaf.ts", type: "flatten" },
            { path: "/root/sample1OnlyLeaf.scss", type: "exclude" }
        ]
        fileName = "foo_2019-04-22_18-01"
        fileNameWithExtension = "foo_2019-04-22_18-01.cc.json"
        FileDownloader["downloadData"] = jest.fn()
    })

    describe("downloadCurrentMap", () => {
        it("should call downloadData with undecorated ExportCCFile", () => {
            downloadSettings = []

            const expected = klona(TEST_FILE_DATA_DOWNLOADED)
            expected.blacklist = []
            expected.edges = []

            FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

            expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
            expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
        })

        it("should call downloadData with undecorated ExportCCFile including undecorated edges", () => {
            downloadSettings = ["Edges"]

            const expected = klona(TEST_FILE_DATA_DOWNLOADED)
            expected.blacklist = []

            FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

            expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
            expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
        })

        it("should call downloadData with undecorated ExportCCFile including blacklist", () => {
            downloadSettings = ["Excludes", "Flattens"]

            const expected = klona(TEST_FILE_DATA_DOWNLOADED)
            expected.edges = []

            FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

            expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
            expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
        })

        it("should call downloadData with undecorated ExportCCFile including attribute Types", () => {
            downloadSettings = ["AttributeTypes"]

            const expected = klona(TEST_FILE_DATA_DOWNLOADED)
            expected.attributeTypes = TEST_ATTRIBUTE_TYPES
            expected.edges = []
            expected.blacklist = []

            FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

            expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
            expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
        })

        it("should call downloadData with undecorated ExportCCFile including attribute Descriptors", () => {
            downloadSettings = ["AttributeDescriptors"]

            const expected = klona(TEST_FILE_DATA_DOWNLOADED)
            expected.attributeDescriptors = TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED
            expected.edges = []
            expected.blacklist = []

            FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

            expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
            expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
        })

        it("should stamp a re-loadable 1.x apiVersion when downloading a 2.0-origin map", () => {
            downloadSettings = []
            const fileMetaFrom2_0 = { ...fileMeta, apiVersion: "2.0" }

            FileDownloader.downloadCurrentMap(map, fileMetaFrom2_0, filesettings, downloadSettings, fileName)

            const downloadedJson = (FileDownloader["downloadData"] as jest.Mock).mock.calls[0][0]
            const downloaded = JSON.parse(downloadedJson)
            expect(downloaded.apiVersion).toBe(packageJson.codecharta.apiVersion)
            expect(checkErrors(downloaded)).not.toContain(ERROR_MESSAGES.majorApiVersionIsOutdated)
        })
    })
})
