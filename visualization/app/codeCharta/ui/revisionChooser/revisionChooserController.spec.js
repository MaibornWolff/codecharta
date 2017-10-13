require("./revisionChooser.ts");
import {RevisionChooserController} from "./revisionChooserComponent.ts";

/**
 * @test {RevisionChooserController}
 */
describe("app.codeCharta.ui.revisionChooser.revisionChooserController", function() {

    var revisionChooserController, dataService, scope;

    beforeEach(()=>{

        //mock module under test
        angular.mock.module("app.codeCharta.ui.revisionChooser");

        //build a module dependent on the module under test and the specific controller under test
        angular.module("sut", ["app.codeCharta.ui.revisionChooser"])
            .controller("revisionChooserController", RevisionChooserController);

        //mock it
        angular.mock.module("sut");

    });


    beforeEach(angular.mock.inject((_dataService_, _$rootScope_, $controller)=>{
        dataService = _dataService_;
        scope = _$rootScope_;
        dataService.data.revisions = ["c", "f"];
        revisionChooserController = $controller("revisionChooserController", {$scope: scope, dataService: dataService});
    }));

    /**
     * @test {RevisionChooserController#constructor}
     */
    it("should have correct values in scope", ()=>{

        expect(revisionChooserController.revisions[0]).to.equal("c");
        expect(revisionChooserController.dataService).to.equal(dataService);

    });

    /**
     * @test {RevisionChooserController#constructor}
     */
    it("should refresh revisions from onDataChanged", ()=>{
        revisionChooserController.onDataChanged({revisions: ["a", "b"]});
        expect(revisionChooserController.revisions[0]).to.equal("a");
    });

    /**
     * @test {RevisionChooserController#loadReferenceMap}
     */
    it("should notify dataService when loadReferenceMap is called", ()=>{

        dataService.setReferenceMap = sinon.spy();
        revisionChooserController.loadReferenceMap(0);
        expect(dataService.setReferenceMap.calledOnce);

    });

    /**
     * @test {RevisionChooserController#loadComparisonMap}
     */
    it("should notify dataService when loadComparisonMap is called", ()=>{

        dataService.setComparisonMap = sinon.spy();
        revisionChooserController.loadComparisonMap(0);
        expect(dataService.setComparisonMap.calledOnce);

    });

});