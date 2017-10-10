require("./threeViewer.js");

/**
 * @test {ThreeCameraService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeCameraService", function() {

    beforeEach(angular.mock.module("app.codeCharta.codeMap.threeViewer"));

    it("should retrieve the angular service instance", angular.mock.inject(function(threeCameraService){
        expect(threeCameraService).to.not.equal(undefined);
    }));

    /**
     * @test {ThreeCameraService#init}
     */
    it("init should create a new PerspectiveCamera", angular.mock.inject(function(threeCameraService){

        //mocks
        let spy = sinon.spy(THREE, "PerspectiveCamera");

        //action
        threeCameraService.init();

        //expectations
        expect(spy.calledOnce);

    }));

    /**
     * @test {ThreeCameraService#init}
     */
    it("init should set the camera position", angular.mock.inject(function(threeCameraService, settingsService){

        //action
        threeCameraService.init();

        //expectations
        expect(threeCameraService.camera.position).to.not.equal(undefined);

    }));



    /**
     * @test {ThreeCameraService#init}
     */
    xit("the near plane of the viewing frustum should be at least 100 to prevent flickering of planes", angular.mock.inject(function(threeCameraService){

        //action
        threeCameraService.init();

        //expectations
        expect(threeCameraService.camera.near).to.be.greaterThan(99);

    }));

});