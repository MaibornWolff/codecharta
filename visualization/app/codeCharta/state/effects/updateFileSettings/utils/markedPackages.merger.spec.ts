import { TEST_FILE_DATA } from "../../../../util/dataMocks"
import { getMergedMarkedPackages } from "./markedPackages.merger"
import { CCFile, MarkedPackage } from "../../../../codeCharta.model"
import { clone } from "../../../../util/clone"

describe("MarkedPackagesMerger", () => {
	describe("getMergedMarkedPackages", () => {
		let mp1: MarkedPackage
		let mp2: MarkedPackage
		let mp3: MarkedPackage
		let mp4: MarkedPackage

		let file1: CCFile
		let file2: CCFile

		beforeEach(() => {
			file1 = clone(TEST_FILE_DATA)
			file1.fileMeta.fileName = "file1"

			file2 = clone(TEST_FILE_DATA)
			file2.fileMeta.fileName = "file2"

			mp1 = {
				path: "/root/nodeA",
				color: "#ABABAB"
			}

			mp2 = {
				path: "/root/nodeB",
				color: "#FFFFFF"
			}

			mp3 = {
				path: "/root/nodeA",
				color: "#ABABAB"
			}

			mp4 = {
				path: "/root/nodeA",
				color: "#ABABAB"
			}
		})

		it("should merge empty markedPackage-arrays", () => {
			file1.settings.fileSettings.markedPackages = []
			file2.settings.fileSettings.markedPackages = []
			expect(getMergedMarkedPackages([file1, file2], false)).toEqual([])
		})

		it("should merge different markedPackages", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp2]
			expect(getMergedMarkedPackages([file1, file2], false)).toMatchSnapshot()
		})

		it("should merge all markedPackages if one file does not contain markedPackages", () => {
			file1.settings.fileSettings.markedPackages = [mp1, mp2]
			file2.settings.fileSettings.markedPackages = null
			expect(getMergedMarkedPackages([file1, file2], false)).toMatchSnapshot()
		})

		it("should merge markedPackage-attributes for the same markedPackage paths", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp3]
			expect(getMergedMarkedPackages([file1, file2], false)).toMatchSnapshot()
		})

		it("should overwrite duplicated markedPackage-attributes for the same markedPackage", () => {
			file1.settings.fileSettings.markedPackages = [mp1]
			file2.settings.fileSettings.markedPackages = [mp4]
			expect(getMergedMarkedPackages([file1, file2], false)).toMatchSnapshot()
		})
	})
})
