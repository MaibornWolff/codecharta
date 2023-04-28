import { State } from "@ngrx/store"
import { CopyToClipboardService } from "./copyToClipboard.service"
import { buildTextOfFiles } from "./util/clipboardString"
import { getFilenamesWithHighestMetrics } from "./util/getFilenamesWithHighestMetrics"
import { CcState } from "../../codeCharta.model"

let service: CopyToClipboardService
jest.mock("./util/clipboardString", () => {
	return { buildTextOfFiles: jest.fn().mockReturnValue("Magic Monday") }
})
jest.mock("./util/getFilenamesWithHighestMetrics", () => {
	return { getFilenamesWithHighestMetrics: jest.fn() }
})

describe("CopyToClipboardService", () => {
	beforeEach(() => {
		const stateStub = {} as unknown as State<CcState>
		service = new CopyToClipboardService(stateStub)
		service["getUnifiedMapNode"] = jest.fn()
	})

	describe("getClipboardText", () => {
		it("should call functions to convert state and to build text", () => {
			const stateConverterMock = getFilenamesWithHighestMetrics
			const buildTextMock = buildTextOfFiles

			const clipboardText = service.getClipboardText()

			expect(clipboardText).toBe("Magic Monday")
			expect(stateConverterMock).toHaveBeenCalled()
			expect(buildTextMock).toHaveBeenCalled()
		})
	})
})
