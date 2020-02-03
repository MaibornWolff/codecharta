import { CCFile, MarkedPackage } from "../../../../codeCharta.model"
import { TEST_FILE_DATA } from "../../../../util/dataMocks"
import _ from "lodash"
import { getMergedMarkedPackages } from "./markedPackages.merger"

describe("MarkedPackagesReset", () => {
	describe("getMergedMarkedPackages", () => {
		let mp1: MarkedPackage
		let mp2: MarkedPackage
		let mp3: MarkedPackage
		let mp4: MarkedPackage

		let file1: CCFile
		let file2: CCFile

		beforeEach(() => {
			file1 = _.cloneDeep(TEST_FILE_DATA)
			file1.fileMeta.fileName = "file1"

			file2 = _.cloneDeep(TEST_FILE_DATA)
			file2.fileMeta.fileName = "file2"

			mp1 = {
				path: "/root/nodeA",
				color: "#ABABAB",
				attributes: {
					name: "nodeA"
				}
			}

			mp2 = {
				path: "/root/nodeB",
				color: "#FFFFFF",
				attributes: {
					name: "nodeB"
				}
			}

			mp3 = {
				path: "/root/nodeA",
				color: "#ABABAB",
				attributes: {
					another: "nodeA"
				}
			}

			mp4 = {
				path: "/root/nodeA",
				color: "#ABABAB",
				attributes: {
					name: "overwrite nodeA"
				}
			}
		})

		it("should merge empty markedPackage-arrays", () => {
			file1.settings.fileSettings.markedPackages = []
			file2.settings.fileSettings.markedPackages = []
			expect(getMergedMarkedPackages([file1, file2])).toEqual([])
		})

		it("should merge different markedPackages", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp2]
			expect(getMergedMarkedPackages([file1, file2])).toMatchSnapshot()
		})

		it("should merge all markedPackages if one file does not contain markedPackages", () => {
			file1.settings.fileSettings.markedPackages = [mp1, mp2]
			file2.settings.fileSettings.markedPackages = null
			expect(getMergedMarkedPackages([file1, file2])).toMatchSnapshot()
		})

		it("should merge markedPackage-attributes for the same markedPackage paths", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp3]
			expect(getMergedMarkedPackages([file1, file2])).toMatchSnapshot()
		})

		it("should overwrite duplicated markedPackage-attributes for the same markedPackage", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp4]
			expect(getMergedMarkedPackages([file1, file2])).toMatchSnapshot()
		})
	})
})
