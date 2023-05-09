import { maxTreeMapFiles } from "./maxTreeMapFiles.reducer"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

describe("maxTreeMapFiles", () => {
	it("should set new maxTreeMapFiles", () => {
		const result = maxTreeMapFiles(100, setMaxTreeMapFiles({ value: 200 }))

		expect(result).toEqual(200)
	})
})
