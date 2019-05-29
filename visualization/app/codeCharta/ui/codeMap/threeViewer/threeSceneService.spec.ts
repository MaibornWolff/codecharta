import { NG } from "../../../../../mocks/ng.mockhelper"

require("./threeViewer.module")

/**
 * @test {ThreeSceneService}
 */
describe("app.codeCharta.ui.codeMap.threeViewer.threeSceneService", () => {
	//noinspection TypeScriptUnresolvedVariable
	beforeEach(NG.mock.module("app.codeCharta.ui.codeMap.threeViewer"))

	//noinspection TypeScriptUnresolvedVariable
	it(
		"should retrieve the angular service instance",
		NG.mock.inject(threeSceneService => {
			expect(threeSceneService).not.toBe(undefined)
		})
	)
})
