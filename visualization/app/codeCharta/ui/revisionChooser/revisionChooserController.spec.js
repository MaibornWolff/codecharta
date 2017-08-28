require("./revisionChooser.js");

import {CodeMap} from "../../core/data/model/codeMap";

/**
 * @test {RevisionChooserController}
 */
describe("app.codeCharta.ui.revisionChooser.revisionChooserController", function() {

    var revisionChooserController, dataService, scope;

    var validData;

    beforeEach(()=>{
        validData = new CodeMap("file", "project", {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 30, "functions": 100, "mcc": 100},
                            "children": []
                        },
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10},
                            "children": []
                        }
                    ]
                }
            ]
        });
    });

    beforeEach(angular.mock.module("app.codeCharta.ui.revisionChooser"));

    beforeEach(angular.mock.inject((_dataService_, _$rootScope_, $controller)=>{
        dataService = _dataService_;
        scope = _$rootScope_;
        dataService.data.revisions = [validData, validData];
        revisionChooserController = $controller("revisionChooserController", {$scope: scope, dataService: dataService});
    }));

    /**
     * @test {RevisionChooserController#constructor}
     */
    it("should have correct values in scope", ()=>{

        console.log(revisionChooserController);
        expect(revisionChooserController.revisions[0]).to.equal(validData);
        expect(revisionChooserController.dataService).to.equal(dataService);

    });

    /**
     * @test {RevisionChooserController#constructor}
     */
    it("should refresh revisions from data-changed event", ()=>{

        scope.$broadcast("data-changed", {map: validData, revisions: [validData, validData]});

        expect(revisionChooserController.revisions[0]).to.equal(validData);

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