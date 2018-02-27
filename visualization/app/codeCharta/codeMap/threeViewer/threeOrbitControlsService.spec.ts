import "./threeViewer";
import {NG} from "../../../../mocks/ng.mockhelper";

/**
 * @test {ThreeOrbitControlsService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeOrbitControlsService", function() {

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NG.mock.module("app.codeCharta.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    it("should retrieve the angular service instance", NG.mock.inject(function(threeOrbitControlsService){
        expect(threeOrbitControlsService).not.toBe(undefined);
    }));

});