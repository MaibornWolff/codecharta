require("./threeViewer.ts");

/**
 * @test {ThreeUpdateCycleService}
 */
describe("app.codeCharta.codeMap.threeViewer.threeUpdateCycleService", function() {

    beforeEach(angular.mock.module("app.codeCharta.codeMap.threeViewer"));

    /**
     * @test {ThreeUpdateCycleService#constructor}
     */
    it("should retrieve the angular service instance with no updatable references", angular.mock.inject(function(threeUpdateCycleService){
        expect(threeUpdateCycleService).to.not.equal(undefined);
        expect(threeUpdateCycleService.updatables.length).to.equal(0);
    }));

    /**
     * @test {ThreeUpdateCycleService#update}
     */
    it("added updatable references should be updated on update call", angular.mock.inject(function(threeUpdateCycleService){

        let ref1 = sinon.spy();
        let ref2 = sinon.spy();

        threeUpdateCycleService.updatables.push(ref1, ref2);
        threeUpdateCycleService.update();

        expect(ref1.calledOnce);
        expect(ref2.calledOnce);

    }));

});