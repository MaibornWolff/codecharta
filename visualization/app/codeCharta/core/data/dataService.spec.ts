import "./data.ts";
import angular from "angular";

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", function() {

    var rootNode;
    var firstFile;
    var twoRevFile;
    var dataService;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.core.data"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject(function (_dataService_) {dataService = _dataService_;}));

    beforeEach(function(){

        rootNode = {
            children: [],
            attributes: {}
        };

        firstFile = {
            children: [],
            attributes: {anAttribute: "value"}
        };

        twoRevFile = {
            "revisions": [
                //First Revision
                {
                    "name": "root",
                    attributes: {},
                    "children": [
                        {
                            "name": "big leaf",
                            attributes: {"Statements": 100, "Functions": 10, "Average Complexity*": 1},
                            "link": "http://www.google.de"
                        },
                        {
                            "name": "Parent Leaf",
                            attributes: {},
                            "children": [
                                {
                                    "name": "small leaf",
                                    attributes: {"Statements": 30, "Functions": 100, "Average Complexity*": 100},
                                    children: []
                                },
                                {
                                    "name": "other small leaf",
                                    attributes: {"Statements": 70, "Functions": 1000, "Average Complexity*": 10},
                                    children: []
                                }
                            ]
                        }
                    ]
                },

                //Second Revision
                {
                    "name": "root",
                    attributes: {},
                    "children": [
                        {
                            "name": "big leaf",
                            attributes: {"Statements": 90, "Functions": 11, "Average Complexity*": 1},
                            "link": "http://www.google.de"
                        },
                        {
                            "name": "Parent Leaf",
                            attributes: {},
                            "children": [
                                {
                                    "name": "small leaf",
                                    attributes: {"Statements": 30, "Functions": 100, "Average Complexity*": 100},
                                    children: []
                                },
                                {
                                    "name": "other small leaf",
                                    attributes: {"Statements": 70, "Functions": 1000, "Average Complexity*": 10},
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        };

    });

    /**
     * @test {DataService#constructor}
     */
    it("metrics should be empty when no file is loaded", () => {

        // system under test
        let sut = dataService;

        // assertion
        expect(sut.data.metrics.length).toBe(0);

    });

    xit("should find all metrics, even in child nodes", (done) => {

        // system under test
        let sut = dataService;

        // assertion
        rootNode.children.push(firstFile);
        sut.setFileData(rootNode).then(
            ()=>{
                expect(sut.data.metrics.length).toBe(1);
                done();
            },
            ()=>{
                done("failure");
            }
        );

    });

    xit("there should be two revisions when json has two revisions", (done) => {

        // system under test
        let sut = dataService;

        // assertion
        sut.setFileData(twoRevFile,()=>{
            //error
            done("should not happen");
        }, ()=>{
            //success
            expect(sut.data.revisions.length).toBe(2);

            done();
        });

    });

    /**
     * @test {DataService#calculateAttributeListDelta}
     */
    xit("checking delta calculation between two attribute lists", () => {

        //inputs
        let a = {"a":100,"b":10,"c":1};
        let b = {"a":110,"b":11,"c":0};
        let c = {"a":110,"b":11,"c":0, "d":10};
        let d = {"a":110,"b":11};
        let e = {"d":110,"e":11};

        // system under test
        let sut = dataService;

        // assertion
        let ab = sut.calculateAttributeListDelta(a,b);
        expect(ab.a).toBe(b.a-a.a);
        expect(ab.b).toBe(b.b-a.b);
        expect(ab.c).toBe(b.c-a.c);

        let ac = sut.calculateAttributeListDelta(a,c);
        expect(ac.a).toBe(c.a-a.a);
        expect(ac.b).toBe(c.b-a.b);
        expect(ac.c).toBe(c.c-a.c);
        expect(ac.d).toBe(c.d);

        let ad = sut.calculateAttributeListDelta(a,d);
        expect(ad.a).toBe(d.a-a.a);
        expect(ad.b).toBe(d.b-a.b);
        expect(ad.c).toBe(undefined);

        let ae = sut.calculateAttributeListDelta(a,e);
        expect(ae.a).toBe(undefined);
        expect(ae.b).toBe(undefined);
        expect(ae.c).toBe(undefined);
        expect(ae.d).toBe(e.d);
        expect(ae.e).toBe(e.e);

    });

    it("should retrieve instance", ()=>{
        expect(dataService).not.toBe(undefined);
    });


});

