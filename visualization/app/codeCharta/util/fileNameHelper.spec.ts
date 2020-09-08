import { FileNameHelper } from "./fileNameHelper"
import { stubDate } from "../../../mocks/dateMock.helper"

describe("FileNameHelper", () => {
	stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))
	const newDate = "2018-12-14_09-39"

	describe("getNewFileName", () => {
		it("should not have multiple timestamps", () => {
			const fileName = "foo_2019-04-22_18-01.cc.json"
			const newFileName = "foo_" + newDate

			const result = FileNameHelper.getNewFileName(fileName, false)

			expect(result).toEqual(newFileName)
		})

		it("should insert the valid date", () => {
			const fileName = "prefix.name.suffix.cc.json"
			const newFileName = "prefix.name.suffix_" + newDate

			const result = FileNameHelper.getNewFileName(fileName, false)

			expect(result).toEqual(newFileName)
		})

		it("should insert the date and use .cc.json as ending instead of just .json", () => {
			const fileName = "prefix.name.suffix.json"
			const newFileName = "prefix.name.suffix_" + newDate

			const result = FileNameHelper.getNewFileName(fileName, false)

			expect(result).toEqual(newFileName)
		})

		it("should replace the date with the valid one", () => {
			const fileName = "prefix.name.suffix_2000-01-01_01-01.cc.json"
			const newFileName = "prefix.name.suffix_" + newDate

			const result = FileNameHelper.getNewFileName(fileName, false)

			expect(result).toEqual(newFileName)
		})
	})

	describe("withoutCCJsonExtension", () => {
		it("should remove .cc.json", () => {
			const fileName = "prefix.name.suffix.cc.json"

			const actual = FileNameHelper.withoutCCJsonExtension(fileName)

			expect(actual).toBe("prefix.name.suffix")
		})

		it("should remove .json", () => {
			const fileName = "prefix.name.suffix.json"

			const actual = FileNameHelper.withoutCCJsonExtension(fileName)

			expect(actual).toBe("prefix.name.suffix")
		})

		it("should remove .cc", () => {
			const fileName = "prefix.name.suffix.cc"

			const actual = FileNameHelper.withoutCCJsonExtension(fileName)

			expect(actual).toBe("prefix.name.suffix")
		})
	})
})
