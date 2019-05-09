import { FileNameHelper } from "./fileNameHelper"
import { stubDate } from "../../../mocks/dateMock.helper"

describe("FileNameHelper", () => {

	stubDate(new Date("2018-12-14T09:39:59"))
    
    describe("getNewFileName", () => {
        it("should not have multiple timestamps", () => {
			const fileName = "foo_2019-04-22_18-01.cc.json"
			const newFileName = "foo_2018-12-14_9-39.cc.json"

			const result = FileNameHelper.getNewFileName(fileName)

			expect(result).toEqual(newFileName)
		})

		it("should insert the valid date", () => {
			const fileName = "prefix.name.suffix.cc.json"
			const newFileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			const result = FileNameHelper.getNewFileName(fileName)

			expect(result).toEqual(newFileName)
		})

		it("should insert the date and use .cc.json as ending instead of just .json", () => {
			const fileName = "prefix.name.suffix.json"
            const newFileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"
            
			const result = FileNameHelper.getNewFileName(fileName)

			expect(result).toEqual(newFileName)
		})

		it("should replace the date with the valid one", () => {
			const fileName = "prefix.name.suffix_2000-01-01_01-01.cc.json"
            const newFileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			const result = FileNameHelper.getNewFileName(fileName)

			expect(result).toEqual(newFileName)
		})

		it("should replace the date with the valid one and use .cc.json as ending instead of just .json", () => {
			const fileName = "prefix.name.suffix_2000-01-01_01-01.json"
            const newFileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			const result = FileNameHelper.getNewFileName(fileName)

			expect(result).toEqual(newFileName)
		})
    })
});