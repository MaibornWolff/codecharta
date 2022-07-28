import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"
import { CcState } from "../../../../state/store/store"
import { matchingFilesCounterSelector } from "./matchingFilesCounter.selector"

jest.mock("../../../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
	accumulatedDataSelector: () => ({
		unifiedMapNode: {
			name: "root",
			type: "Folder",
			path: "/root",
			children: [
				{ name: "big leaf", type: "File", path: "/root/big leaf", link: "https://www.google.de" },
				{
					name: "Parent Leaf",
					type: "Folder",
					path: "/root/Parent Leaf",
					children: [
						{ name: "small leaf", type: "File", path: "/root/Parent Leaf/small leaf" },
						{ name: "other small leaf", type: "File", path: "/root/Parent Leaf/other small leaf" }
					]
				}
			]
		}
	})
}))
jest.mock("../../../../state/store/dynamicSettings/searchPattern/searchPattern.selector", () => ({
	searchPatternSelector: () => "small leaf"
}))
jest.mock("../../../../state/store/fileSettings/blacklist/blacklist.selector", () => ({
	blacklistSelector: () => {
		const excluded: BlacklistItem = { path: "big Leaf", type: "exclude" as BlacklistType }
		const flattened: BlacklistItem = { path: "small leaf", type: "flatten" as BlacklistType }
		return [excluded, flattened]
	}
}))

describe("matchingFilesCounterSelector", () => {
	it("should calculate matching files counter", () => {
		// all input selectors are mocked above
		const fakeState = {} as unknown as CcState
		expect(matchingFilesCounterSelector(fakeState)).toEqual({
			excludeCount: "0/1",
			fileCount: "2/3",
			flattenCount: "1/1"
		})
	})
})
