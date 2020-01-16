import { EnvDetector } from "./envDetector"

describe("EnvDetector", () => {
	describe("doSomething", () => {
		it("should do something", () => {
			EnvDetector.isNodeJs()
		})
	})
})
