require("./threeViewer");
import {NG} from "../../../../mocks/ng.mockhelper";

/**
 * @test {ThreeSceneService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeSceneService", function() {

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.module("app.codeCharta.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", NG.mock.inject(function(threeSceneService){
        expect(threeSceneService).not.toBe(undefined);
    }));

});