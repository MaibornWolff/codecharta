require("./threeViewer.js");

/**
 * @test {ThreeSceneService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeSceneService", function() {

    beforeEach(angular.mock.module("app.codeCharta.codeMap.threeViewer"));
    
    it("should retrieve the angular service instance", angular.mock.inject(function(threeSceneService){
        expect(threeSceneService).to.not.equal(undefined);
    }));

    /**
     * @test {ThreeSceneService#constructor}
     */
    it("constructor should create a new Scene", ()=>{

        //mocks
        var ori = THREE.Scene;
        THREE.Scene = sinon.spy();

        angular.mock.inject(function(threeSceneService){

            //expectations
            expect(THREE.Scene.calledOnce);

        });

        THREE.Scene = ori;

    });

});