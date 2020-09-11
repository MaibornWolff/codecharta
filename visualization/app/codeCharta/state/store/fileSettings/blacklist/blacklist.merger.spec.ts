import { getMergedBlacklist } from "./blacklist.merger"
import { TEST_FILE_DATA } from "../../../../util/dataMocks"
import { BlacklistItem, BlacklistType, CCFile } from "../../../../codeCharta.model"
import { clone } from "../../../../util/clone"

describe("BlacklistMerger", () => {
	let file1: CCFile
	let file2: CCFile

	beforeEach(() => {
		file1 = clone(TEST_FILE_DATA)
		file1.fileMeta.fileName = "file1"

		file2 = clone(TEST_FILE_DATA)
		file2.fileMeta.fileName = "file2"
	})

	describe("getMergedBlacklist", () => {
		const blacklistItem1: BlacklistItem = { path: "/root/nodeA", type: BlacklistType.exclude }
		const blacklistItem2: BlacklistItem = { path: "/another/nodeB", type: BlacklistType.flatten }
		const blacklistItem3: BlacklistItem = { path: "/another/nodeC", type: BlacklistType.exclude }
		const blacklistItem4: BlacklistItem = { path: "*prefix/nodeD", type: BlacklistType.flatten }
		const blacklistItem1Duplicate: BlacklistItem = { path: "/root/nodeA", type: BlacklistType.exclude }

		it("should merge blacklist for different paths", () => {
			file1.settings.fileSettings.blacklist = [blacklistItem1, blacklistItem2]
			file2.settings.fileSettings.blacklist = [blacklistItem3, blacklistItem4]
			expect(getMergedBlacklist([file1, file2], false)).toMatchSnapshot()
		})

		it("should only contain unique paths+type", () => {
			file1.settings.fileSettings.blacklist = [blacklistItem1, blacklistItem2]
			file2.settings.fileSettings.blacklist = [blacklistItem1Duplicate, blacklistItem4]
			expect(getMergedBlacklist([file1, file2], false)).toMatchSnapshot()
		})
	})
})
