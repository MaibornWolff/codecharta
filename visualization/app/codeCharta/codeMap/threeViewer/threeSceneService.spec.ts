require("./threeViewer.ts");
import angular from "angular";

/**
 * @test {ThreeSceneService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeSceneService", function() {

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", angular.mock.inject(function(threeSceneService){
        expect(threeSceneService).not.toBe(undefined);
    }));

});