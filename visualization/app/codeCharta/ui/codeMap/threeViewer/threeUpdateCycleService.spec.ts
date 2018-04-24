import "./threeViewer";
import {NG} from "../../../../../mocks/ng.mockhelper";
import sinon from "sinon";
import angular from "angular";

/**
 * @test {ThreeUpdateCycleService}
 */
describe("app.codeCharta.ui.codeMap.threeViewer.threeUpdateCycleService", function() {


    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.ui.codeMap.threeViewer"));

    //noinspection TypeScriptUnresolvedVariable
    /**
     * @test {ThreeUpdateCycleService#constructor}
     */
    it("should retrieve the angular service instance with no updatable references", NG.mock.inject(function(threeUpdateCycleService){
        expect(threeUpdateCycleService).not.toBe(undefined);
        expect(threeUpdateCycleService.updatables.length).toBe(0);
    }));

    //noinspection TypeScriptUnresolvedVariable
    /**
     * @test {ThreeUpdateCycleService#update}
     */
    it("added updatable references should be updated on update call", NG.mock.inject(function(threeUpdateCycleService){

        let ref1 = sinon.spy();
        let ref2 = sinon.spy();

        threeUpdateCycleService.updatables.push(ref1, ref2);
        threeUpdateCycleService.update();

        expect(ref1.calledOnce);
        expect(ref2.calledOnce);

    }));

});