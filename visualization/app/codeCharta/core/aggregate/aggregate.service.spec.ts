import "./aggregate.module";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import {CodeMap} from "../data/model/codeMap";


/**
 * @test {Aggregate}
 */
describe("app.codeCharta.core.aggregate", function() {


    const file1: CodeMap = {
        fileName: "file1",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "other small leaf",
                            type: "File",
                            attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                        }
                    ]
                }
            ]
        }
    };

    const file2: CodeMap = {
        fileName: "file2",
        projectName: "Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            children: [
                {
                    name: "big leaf",
                    type: "File",
                    attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                    link: "http://www.google.de"
                },
                {
                    name: "Parent Leaf",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "small leaf",
                            type: "File",
                            attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                        }
                    ]
                }
            ]
        }
    };

    const file_aggregation_two: CodeMap = {
        fileName: "Aggregation of following files: file1, file2",
        projectName: "Aggregation of following projects: Sample Project, Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            origin: "Aggregation of following files: file1, file2",
            visible: true,
            path: "/root",
            children: [
                {
                    name: "file1",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            type: "File",
                            attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            type: "Folder",
                            attributes: {},
                            children: [
                                {
                                    name: "other small leaf",
                                    type: "File",
                                    attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                                }
                            ]
                        }
                    ]
                },
                {

                    name: "file2",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            type: "File",
                            attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            type: "Folder",
                            attributes: {},
                            children: [
                                {
                                    name: "small leaf",
                                    type: "File",
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
        fileName: "Aggregation of following files: file1, file2, file1, file2",
        projectName: "Aggregation of following projects: Sample Project, Sample Project, Sample Project, Sample Project",
        root: {
            name: "root",
            type: "Folder",
            attributes: {},
            origin: "Aggregation of following files: file1, file2, file1, file2",
            visible: true,
            path: "/root",
            children: [{
                name: "file1",
                type: "Folder",
                attributes: {},
                children: [
                    {
                        name: "big leaf",
                        type: "File",
                        attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                        link: "http://www.google.de"
                    },
                    {
                        name: "Parent Leaf",
                        type: "Folder",
                        attributes: {},
                        children: [
                            {
                                name: "other small leaf",
                                type: "File",
                                attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                            }
                        ]
                    }
                ]
            },
                {

                    name: "file2",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            type: "File",
                            attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            type: "Folder",
                            attributes: {},
                            children: [
                                {
                                    name: "small leaf",
                                    type: "File",
                                    attributes: {"rloc": 60, "functions": 200, "mcc": 200}
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "file1",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            type: "File",
                            attributes: {"rloc": 100, "functions": 10, "mcc": 1},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            type: "Folder",
                            attributes: {},
                            children: [
                                {
                                    name: "other small leaf",
                                    type: "File",
                                    attributes: {"rloc": 70, "functions": 1000, "mcc": 10}
                                }
                            ]
                        }
                    ]
                },
                {

                    name: "file2",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "big leaf",
                            type: "File",
                            attributes: {"rloc": 200, "functions": 20, "mcc": 2},
                            link: "http://www.google.de"
                        },
                        {
                            name: "Parent Leaf",
                            type: "Folder",
                            attributes: {},
                            children: [
                                {
                                    name: "small leaf",
                                    type: "File",
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
        expect(aggregateMapService).not.toBe(undefined);
    }));

    /**
     * @test {aggregateMapService}
     */
    it ( "aggregation of two maps",NGMock.mock.inject(function(aggregateMapService){
        let aggregated: CodeMap;
        aggregated = aggregateMapService.aggregateMaps([file1,file2]);
        expect(aggregated).toEqual(file_aggregation_two);
    }));

    /**
     * @test {aggregateMapService}
     */
    it ( "aggregation of four maps",NGMock.mock.inject(function(aggregateMapService){
        let aggregated: CodeMap;
        aggregated = aggregateMapService.aggregateMaps([file1,file2,file1,file2]);
        expect(aggregated).toEqual(file_aggregation_four);
    }));

    /**
     * @test {aggregateMapService}
     */
    it ( "aggregation one map",NGMock.mock.inject(function(aggregateMapService){
        let aggregated: CodeMap;
        aggregated = aggregateMapService.aggregateMaps([file1]);
        expect(aggregated).toEqual(file1);
    }));


});