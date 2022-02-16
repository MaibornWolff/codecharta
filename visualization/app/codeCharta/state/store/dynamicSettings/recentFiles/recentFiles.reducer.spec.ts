import { recentFiles } from "./recentFiles.reducer"
import { RecentFilesAction, setRecentFiles } from "./recentFiles.actions"

describe("recentFiles", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = recentFiles(undefined, {} as RecentFilesAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_RECENT_FILES", () => {
		it("should set new recentFiles", () => {
			const result = recentFiles([], setRecentFiles(["sample1.cc.json", "sample2.cc.json"]))

			expect(result).toEqual(["sample1.cc.json", "sample2.cc.json"])
		})

		it("should set default recentFiles", () => {
			const result = recentFiles(["sample1.cc.json", "sample2.cc.json"], setRecentFiles())

			expect(result).toEqual([])
		})
	})
})
