import {NG} from "../../../../../mocks/ng.mockhelper";

require("./threeViewer");

/**
 * @test {ThreeSceneService}
 */
describe("app.codeCharta.ui.codeMap.threeViewer.threeSceneService", function() {

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.module("app.codeCharta.ui.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", NG.mock.inject(function(threeSceneService){
        expect(threeSceneService).not.toBe(undefined);
    }));

});