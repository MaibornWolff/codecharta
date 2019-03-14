import {AttributeType, BlacklistItem, BlacklistType, CCFile, Edge} from "../codeCharta.model";
import {AggregationGenerator} from "./aggregationGenerator";

describe("app.codeCharta.util.aggregationGenerator", function() {

    const file1: CCFile = {
        fileMeta: {
            fileName: "file1",
            projectName: "Sample Project",
            apiVersion: "1.1"
        },
        map: {
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
        },
        settings: {
            fileSettings: {}
        }
    };

    const file2: CCFile = {
        fileMeta: {
            fileName: "file2",
            projectName: "Sample Project",
            apiVersion: "1.1"
        },
        map: {
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
        },
        settings: {
            fileSettings: {}
        }
    };

    describe("multipleService", () => {

        it("aggregation of two maps", () => {
            let aggregationFile: CCFile;
            aggregationFile = AggregationGenerator.getAggregationFile([file1, file2]);
            expect(aggregationFile).toMatchSnapshot();
        });

        it("aggregation of four maps", () => {
            let aggregationFile: CCFile;
            aggregationFile = AggregationGenerator.getAggregationFile([file1, file2, file1, file2]);
            expect(aggregationFile).toMatchSnapshot();
        });

        it("aggregation one map", () => {
            let aggregationFile: CCFile;
            aggregationFile = AggregationGenerator.getAggregationFile([file1]);
            expect(aggregationFile).toMatchSnapshot();
        });

        it("aggregate two aggregated maps should aggregate the attributes to root", () => {
            let aggregationFile: CCFile;
            aggregationFile = AggregationGenerator.getAggregationFile([file1, file2]);
            expect(aggregationFile.map.attributes.rloc).toBe(430)
            expect(aggregationFile.map.attributes.functions).toBe(1230)
            expect(aggregationFile.map.attributes.mcc).toBe(213)
            expect(aggregationFile.map.attributes.customMetric).toBe(7)
        });
    });

    describe("edges merge", () => {

        const edges1: Edge[] = [
            {
                fromNodeName: "/root/big leaf",
                toNodeName: "/root/Parent Leaf/small leaf",
                attributes: {
                    pairingRate: 9,
                    avgCommits: 4
                }
            }
        ];

        const edges2: Edge[] = [
            {
                fromNodeName: "/root/big leaf",
                toNodeName: "/root/Parent Leaf/small leaf",
                attributes: {
                    pairingRate: 89,
                    avgCommits: 34
                }
            }
        ];

        it("aggregation of two maps with empty edges should result in empty edges", () => {
            file1.settings.fileSettings.edges = [];
            file2.settings.fileSettings.edges = [];
            let aggregationFile: CCFile = AggregationGenerator.getAggregationFile([file1,file2]);
            expect(aggregationFile.settings.fileSettings.edges).toEqual([]);
        });

        it("aggregation of two maps with given edges should result in summarized edges", () => {
            file1.settings.fileSettings.edges = edges1;
            file2.settings.fileSettings.edges = edges2;
            let aggregationFile = AggregationGenerator.getAggregationFile([file1,file2]);
            expect(aggregationFile.settings.fileSettings.edges).toMatchSnapshot();
        });

        it("aggregation of one map with edges and other without should result in merged edges", () => {
            file1.settings.fileSettings.edges = [edges1[0], edges2[0]];
            file2.settings.fileSettings.edges = null;
            let aggregationFile = AggregationGenerator.getAggregationFile([file1,file2]);
            expect(aggregationFile.settings.fileSettings.edges).toMatchSnapshot();
        });

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

        it("aggregation of two maps with different key attributes should result in all keys aggregated map", () => {
            file1.settings.fileSettings.attributeTypes = attribute1;
            file2.settings.fileSettings.attributeTypes = attribute2;
            let aggregationFile = AggregationGenerator.getAggregationFile([file1,file2]);
            expect(aggregationFile.settings.fileSettings.attributeTypes).toMatchSnapshot();
        });

        it("aggregation of one map with attributes and other without should result in merged with same attributes as the one with them",() => {
            file1.settings.fileSettings.attributeTypes = attribute1;
            file2.settings.fileSettings.attributeTypes = {};
            let aggregationFile = AggregationGenerator.getAggregationFile([file1,file2]);
            expect(aggregationFile.settings.fileSettings.attributeTypes).toMatchSnapshot();
        });

    });

    describe("Blacklist merge", ()=> {

        const blacklist1: BlacklistItem[] = [
            {
                path: "/root/node/equalPath",
                type: BlacklistType.exclude
            },
            {
                path: "/another/third/path",
                type: BlacklistType.hide
            }
        ];

        const blacklist2: BlacklistItem[] = [
            {
                path: "/root/node/equalPath",
                type: BlacklistType.exclude
            },
            {
                path: "*another/path",
                type: BlacklistType.hide
            }
        ];

        it("aggregation of two maps with different key attributes should result in all keys aggregated map", () => {
            file1.settings.fileSettings.blacklist = blacklist1;
            file2.settings.fileSettings.blacklist = blacklist2;
            let multiple = AggregationGenerator.getAggregationFile([file1,file2]);
            expect(multiple.settings.fileSettings.blacklist).toMatchSnapshot();
        });
    });
});