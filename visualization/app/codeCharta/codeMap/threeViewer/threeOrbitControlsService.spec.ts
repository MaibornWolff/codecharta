import "./threeViewer.ts";
import angular from "angular";

/**
 * @test {ThreeOrbitControlsService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeOrbitControlsService", function() {

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", angular.mock.inject(function(threeOrbitControlsService){
        expect(threeOrbitControlsService).not.toBe(undefined);
    }));

});