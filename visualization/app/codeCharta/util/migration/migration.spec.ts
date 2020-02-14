import { migrate } from "./migration"
import { TEST_FILE_CONTENT_0_1 } from "../dataMocks"
import { FileValidator } from "../fileValidator"

describe("Migration", () => {
	describe("from 0.1 to 1.0", () => {
		it("should remove the fileName attribute", () => {
			const result = migrate(TEST_FILE_CONTENT_0_1)

			expect(FileValidator.validate(result)).toEqual([])
		})
	})
})
