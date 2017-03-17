require("./threeViewer.js");

/**
 * @test {ThreeOrbitControlsService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeOrbitControlsService", function() {

    beforeEach(angular.mock.module("app.codeCharta.codeMap.threeViewer"));
    
    it("should retrieve the angular service instance", angular.mock.inject(function(threeOrbitControlsService){
        expect(threeOrbitControlsService).to.not.equal(undefined);
    }));

});