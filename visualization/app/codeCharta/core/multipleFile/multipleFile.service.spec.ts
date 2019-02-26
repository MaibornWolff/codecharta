import "./multipleFile.module";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import {AttributeType, BlacklistType, CodeMap, Edge} from "../data/model/CodeMap";

describe("app.codeCharta.core.multiple", function() {

    const file1: CodeMap = {
        fileName: "file1",
        projectName: "Sample Project",
        nodes: {
            name: "root",
            type: "Folder",
            attributes: {"rloc": 170, "functions": 1010, "mcc": 11},
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
                    attributes: {"rloc": 70, "functions": 1000, "mcc": 10},
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
        nodes: {
            name: "root",
            type: "Folder",
            attributes: {"rloc" : 260, "functions": 220, "mcc" : 202, "customMetric" : 7},
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
                    attributes: {"rloc": 60, "functions": 200, "mcc": 200},
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

    beforeEach(NGMock.mock.module("app.codeCharta.core.multiple"));

    describe("multipleService", function() {

        it("instance", NGMock.mock.inject(function (multipleFileService) {
            expect(multipleFileService).not.toBe(undefined);
        }));

        it("aggregation of two maps", NGMock.mock.inject(function (multipleFileService) {
            let multiple: CodeMap;
            multiple = multipleFileService.aggregateMaps([file1, file2]);
            expect(multiple).toMatchSnapshot();
        }));

        it("aggregation of four maps", NGMock.mock.inject(function (multipleFileService) {
            let multiple: CodeMap;
            multiple = multipleFileService.aggregateMaps([file1, file2, file1, file2]);
            expect(multiple).toMatchSnapshot();
        }));

        it("aggregation one map", NGMock.mock.inject(function (multipleFileService) {
            let multiple: CodeMap;
            multiple = multipleFileService.aggregateMaps([file1]);
            expect(multiple).toMatchSnapshot();
        }));
        it("aggregate two aggregated maps should aggregate the attributes to root",  NGMock.mock.inject(function (multipleFileService) {
            let multiple: CodeMap;
            multiple = multipleFileService.aggregateMaps([file1, file2]);
            expect(multiple.nodes.attributes.rloc).toBe(430)
            expect(multiple.nodes.attributes.functions).toBe(1230)
            expect(multiple.nodes.attributes.mcc).toBe(213)
            expect(multiple.nodes.attributes.customMetric).toBe(7)
        }));
    });

    describe("edges merge", ()=> {

        const edges1: Edge = [
            {
                fromNodeName: "/root/big leaf",
                toNodeName: "/root/Parent Leaf/small leaf",
                attributes: {
                    pairingRate: 9,
                    avgCommits: 4
                }
            }
        ];

        const edges2: Edge = [
            {
                fromNodeName: "/root/big leaf",
                toNodeName: "/root/Parent Leaf/small leaf",
                attributes: {
                    pairingRate: 89,
                    avgCommits: 34
                }
            }
        ];

        it("aggregation of two maps with empty edges should result in empty edges",NGMock.mock.inject(function(multipleFileService){
            file1.edges = [];
            file2.edges = [];
            let multiple: CodeMap = multipleFileService.aggregateMaps([file1,file2]);
            expect(multiple.edges).toEqual([]);
        }));

        it("aggregation of two maps with given edges should result in summarized edges",NGMock.mock.inject(function(multipleFileService){
            file1.edges = edges1;
            file2.edges = edges2;
            let multiple = multipleFileService.aggregateMaps([file1,file2]);
            expect(multiple.edges).toMatchSnapshot();
        }));

        it("aggregation of one map with edges and other without should result in merged edges",NGMock.mock.inject(function(multipleFileService){
            file1.edges = [edges1[0], edges2[0]];
            file2.edges = null;
            let multiple = multipleFileService.aggregateMaps([file1,file2]);
            expect(multiple.edges).toMatchSnapshot();
        }));

    });


    describe("AttributeTypes merge", ()=> {

        const attribute1 = {
            nodes: {
                ["key1"]: AttributeType.absolute
            },
            edges: {
                ["key2"]: AttributeType.relative
            }
        };

        const attribute2 = {
            nodes: {
                ["key1_2"]: AttributeType.absolute
            },
            edges: {
                ["key2_2"]: AttributeType.relative
            }
        };

        it("aggregation of two maps with different key attributes should result in all keys aggregated map",NGMock.mock.inject(function(multipleFileService){
            file1.attributeTypes = attribute1;
            file2.attributeTypes = attribute2;
            let multiple = multipleFileService.aggregateMaps([file1,file2]);
            expect(multiple.attributeTypes).toMatchSnapshot();
        }));

        it("aggregation of one map with attributes and other without should result in merged with same attributes as the one with them",NGMock.mock.inject(function(multipleFileService){
            file1.attributeTypes = attribute1;
            file2.attributeTypes = {};
            let multiple = multipleFileService.aggregateMaps([file1,file2]);
            expect(multiple.attributeTypes).toMatchSnapshot();
        }));

    });

    describe("Blacklist merge", ()=> {

        const blacklist1 = [
            {
                path: "/root/node/equalPath",
                type: BlacklistType.exclude
            },
            {
                path: "/another/third/path",
                type: BlacklistType.hide
            }
        ];

        const blacklist2 = [
            {
                path: "/root/node/equalPath",
                type: BlacklistType.exclude
            },
            {
                path: "*another/path",
                type: BlacklistType.hide
            }
        ];

        it("aggregation of two maps with different key attributes should result in all keys aggregated map",NGMock.mock.inject(function(multipleFileService){
            file1.blacklist = blacklist1;
            file2.blacklist = blacklist2;
            let multiple = multipleFileService.aggregateMaps([file1,file2]);
            expect(multiple.blacklist).toMatchSnapshot();
        }));
    });
});