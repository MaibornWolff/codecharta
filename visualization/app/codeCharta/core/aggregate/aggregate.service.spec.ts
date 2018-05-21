import "./aggregate.module";
//import angular from "angular";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import {CodeMap} from "../data/model/codeMap";


/**
 * @test {Aggregate}
 */
describe("app.codeCharta.core.aggregate", function() {


    const file1: CodeMap = {
        fileName: "file",
        projectName: "Sample Project",
        root: {
            name: "root",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        }
                    ]
                }
            ]
        }
    };

    const file2: CodeMap = {
        fileName: "file",
        projectName: "Sample Project",
        root: {
            name: "root",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    attributes: {},
                    children: [
                        {
                            name: "small leaf",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    const file_aggregation_two: CodeMap = {
        fileName: "Aggregation of following files: file, file",
        projectName: "Aggregation of following projects: Sample project, Sample project",
        root: {
            name: "root",
            attributes: {},
            children: [
                {
                    name: "Sample Project",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            attributes: {},
                            children: [
                                {
                                    name: "other small leaf",
                                    attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                                }
                            ]
                        }
                    ]
                },
                {

                    name: "Sample Project",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            attributes: {},
                            children: [
                                {
                                    name: "small leaf",
                                    attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                                }
                            ]
                        }
                    ]
                }

            ]
        }
    };

    const file_aggregation_four: CodeMap = {
        fileName: "Aggregation of following files: file, file, file, file",
        projectName: "Aggregation of following projects: Sample project, Sample project, Sample project, Sample project",
        root: {
            name: "root",
            attributes: {},
            children: [{
                name: "Sample Project",
                attributes: {},
                children: [
                    {
                        name: "big leaf",
                        attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                        link: "http://www.google.de"
                    },
                    {
                        name: "Parent Leaf",
                        attributes: {},
                        children: [
                            {
                                name: "other small leaf",
                                attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                            }
                        ]
                    }
                ]
            },
                {

                    name: "Sample Project",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            attributes: {},
                            children: [
                                {
                                    name: "small leaf",
                                    attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "Sample Project",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            attributes: {},
                            children: [
                                {
                                    name: "other small leaf",
                                    attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                                }
                            ]
                        }
                    ]
                },
                {

                    name: "Sample Project",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            attributes: {},
                            children: [
                                {
                                    name: "small leaf",
                                    attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    beforeEach(NGMock.mock.module("app.codeCharta.core.aggregate"));

    /**
     * @test {aggregateMapService}
     */
    it("instance", NGMock.mock.inject(function(aggregateMapService){
        console.log(((file1.root.children[1].path)));
        expect(aggregateMapService).not.toBe(undefined);
    }));

    /**
     * @test {aggregateMapService}
     */
    it ( "aggregation two",NGMock.mock.inject(function(aggregateMapService){
        let aggregated: CodeMap;
        aggregated = aggregateMapService.aggregateMaps([file1,file2]);
        expect(aggregated).toEqual(file_aggregation_two);
    }));

    /**
     * @test {aggregateMapService}
     */
    it ( "aggregation four",NGMock.mock.inject(function(aggregateMapService){
        let aggregated: CodeMap;
        aggregated = aggregateMapService.aggregateMaps([file1,file2,file1,file2]);
        expect(aggregated).toEqual(file_aggregation_four);
    }));

    /**
     * @test {aggregateMapService}
     */
    it ( "aggregation one",NGMock.mock.inject(function(aggregateMapService){
        let aggregated: CodeMap;
        aggregated = aggregateMapService.aggregateMaps([file1]);
        expect(aggregated).toEqual(file1);
    }));


});