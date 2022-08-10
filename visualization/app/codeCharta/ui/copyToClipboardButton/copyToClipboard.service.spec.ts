import { TestBed } from "@angular/core/testing"
import { CopyToClipboardService } from "./copyToClipboard.service"
import { buildTextOfFiles } from "./util/clipboardString"
import { getFilenamesWithHighestMetrics } from "./util/getFilenamesWithHighestMetrics"
let service: CopyToClipboardService
jest.mock("./util/clipboardString", () => {
	return { buildTextOfFiles: jest.fn().mockReturnValue("Magic Monday") }
})
jest.mock("./util/getFilenamesWithHighestMetrics", () => {
	return { getFilenamesWithHighestMetrics: jest.fn() }
})
describe("copyToClipboardService", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [CopyToClipboardService] })
		service = TestBed.inject(CopyToClipboardService)

		jest.clearAllMocks()
	})
	it("should call text function and mapNode function on getClipboardText", () => {
		const clipboardText = service.getClipboardText()

		expect(clipboardText).toBe("Magic Monday")
		expect(buildTextOfFiles).toHaveBeenCalled()
		expect(getFilenamesWithHighestMetrics).toHaveBeenCalled()
	})
})
