import * as d3 from "d3";
import {TEST_DELTA_MAP_A, TEST_DELTA_MAP_B} from "./dataMocks";
import {CCFile} from "../codeCharta.model";
import {NodeDecorator} from "./nodeDecorator";

describe("app.codeCharta.util.nodeDecorator", () => {

    let fileA: CCFile;
    let fileB: CCFile;

    beforeEach(function() {
        fileA = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A));
        fileB = JSON.parse(JSON.stringify(TEST_DELTA_MAP_B));
    });

    describe("decorateLeavesWithMissingMetrics", () => {

        it("leaves should have all metrics", ()=>{
            NodeDecorator.decorateLeavesWithMissingMetrics(fileA, ["some", "metrics", "rloc", "functions", "mcc"]);
            let h = d3.hierarchy(fileA.map);
            h.leaves().forEach((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes.some).toBe(0);
                expect(node.data.attributes.metrics).toBe(0);
                expect(node.data.attributes.rloc).toBeDefined();
                expect(node.data.attributes.functions).toBeDefined();
                expect(node.data.attributes.mcc).toBeDefined();
            });
        });

        it("leaves should have all metrics even if some attributesLists are undefined", ()=>{
            fileA.map.children[0].attributes = undefined;
            NodeDecorator.decorateLeavesWithMissingMetrics(fileA,["some", "metrics", "rloc", "functions", "mcc"]);
            let h = d3.hierarchy(fileA.map);
            h.leaves().forEach((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes.some).toBe(0);
                expect(node.data.attributes.metrics).toBe(0);
                expect(node.data.attributes.rloc).toBeDefined();
                expect(node.data.attributes.functions).toBeDefined();
                expect(node.data.attributes.mcc).toBeDefined();
            });
        });

    });

    describe("compact middle packages",() => {

        it("should compact from root", ()=>{
            fileA.map.children = [{
                name: "middle",
                type: "Folder",
                attributes: {},
                children: [
                    {
                        name: "a",
                        type: "File",
                        attributes: {}
                    },
                    {
                        name: "b",
                        type: "File",
                        attributes: {}

                    }
                ]
            }];
            NodeDecorator.decorateMapWithCompactMiddlePackages(fileA);
            expect(fileA.map.name).toBe("root/middle");
            expect(fileA.map.children.length).toBe(2);
            expect(fileA.map.children[0].name).toBe("a");
            expect(fileA.map.children[1].name).toBe("b");
        });

        it("should collect links correctly", ()=>{
            fileA.map.link = "link0";
            fileA.map.children = [{
                name: "middle",
                type: "File",
                attributes: {},
                link: "link1",
                children: [
                    {
                        name: "a",
                        type: "File",
                        attributes: {}
                    },
                    {
                        name: "b",
                        type: "File",
                        attributes: {}
                    }
                ]
            }];
            NodeDecorator.decorateMapWithCompactMiddlePackages(fileA);
            expect(fileA.map.link).toBe("link1");
        });

        it("should collect paths correctly", ()=>{
            fileA.map.path = "/root";
            fileA.map.children = [{
                name: "middle",
                path: "/root/middle",
                type: "Folder",
                attributes: {},
                children: [
                    {
                        name: "a",
                        type: "File",
                        path: "/root/middle/a",
                        attributes: {}
                    },
                    {
                        name: "b",
                        type: "File",
                        path: "/root/middle/b",
                        attributes: {}
                    }
                ]
            }];
            NodeDecorator.decorateMapWithCompactMiddlePackages(fileA);
            expect(fileA.map.path).toBe("/root/middle");
        });

        it("should not compact with single leaves", ()=>{
            fileA.map.children = [{
                name: "middle",
                type: "Folder",
                attributes: {},
                children: [
                    {
                        name: "singleLeaf",
                        type: "File",
                        attributes: {}
                    }
                ]
            }];
            NodeDecorator.decorateMapWithCompactMiddlePackages(fileA);
            expect(fileA.map.name).toBe("root/middle");
            expect(fileA.map.children.length).toBe(1);
            expect(fileA.map.children[0].name).toBe("singleLeaf");
        });

        it("should compact intermediate middle packages", ()=>{
            fileA.map.children = [{
                name: "start",
                type: "Folder",
                attributes: {},
                children: [
                    {
                        name: "middle",
                        type: "Folder",
                        attributes: {},
                        children: [
                            {
                                name: "middle2",
                                type: "Folder",
                                attributes: {},
                                children: [
                                    {
                                        name: "a",
                                        type: "File",
                                        attributes: {}
                                    },
                                    {
                                        name: "b",
                                        type: "File",
                                        attributes: {}
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "c",
                        type: "File",
                        attributes: {}
                    }
                ]
            }];
            NodeDecorator.decorateMapWithCompactMiddlePackages(fileA);
            expect(fileA.map.name).toBe("root/start");
            expect(fileA.map.children.length).toBe(2);
            expect(fileA.map.children[0].name).toBe("middle/middle2");
            expect(fileA.map.children[1].name).toBe("c");
            expect(fileA.map.children[0].children.length).toBe(2);
            expect(fileA.map.children[0].children[0].name).toBe("a");
            expect(fileA.map.children[0].children[1].name).toBe("b");
        });

    });

    describe("decorateParentNodesWithSumAttributesOfChildren",() => {

        it("all nodes should have an attribute list with all possible metrics", ()=>{
            fileA.map.children[0].attributes = undefined;
            fileA.map.children[1].attributes = { "some": 1 };
            NodeDecorator.decorateLeavesWithMissingMetrics([fileA],["some", "metrics", "rloc", "functions", "mcc"]);
            NodeDecorator.decorateParentNodesWithSumAttributesOfChildren([fileA], ["some", "metrics", "rloc", "functions", "mcc"]);
            let h = d3.hierarchy(fileA.map);
            h.each((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes.some).toBeDefined();
                expect(node.data.attributes.metrics).toBeDefined();
            });
        });

        it("all nodes should have an attribute list with listed and available metrics", ()=>{
            NodeDecorator.decorateLeavesWithMissingMetrics([fileA],["rloc", "functions"]);
            NodeDecorator.decorateParentNodesWithSumAttributesOfChildren([fileA], ["rloc", "functions"]);
            let h = d3.hierarchy(fileA.map);
            h.each((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes["rloc"]).toBeDefined();
                expect(node.data.attributes["functions"]).toBeDefined();
            });
        });

        it("folders should have sum attributes of children", ()=>{
            NodeDecorator.decorateLeavesWithMissingMetrics([fileA],["rloc", "functions"]);
            NodeDecorator.decorateParentNodesWithSumAttributesOfChildren([fileA], ["rloc", "functions"]);
            let h = d3.hierarchy(fileA.map);
            expect(h.data.attributes["rloc"]).toBe(200);
            expect(h.children[0].data.attributes["rloc"]).toBe(100);
            expect(h.data.attributes["functions"]).toBe(1110);
        });

    });

    describe("decorateMapWithOriginAttribute",() => {

        it("all nodes should have an origin", ()=>{
            fileA.map.children[0].origin = undefined;
            NodeDecorator.decorateMapWithOriginAttribute(fileA);
            let h = d3.hierarchy(fileA.map);
            h.each((node)=>{
                expect(node.data.origin).toBeDefined();
            });
        });

    });

    describe("decorateMapWithUnaryMetric",() => {

        it("maps with no attribute nodes should be accepted and an attributes member added", ()=>{

            let cm: CCFile = {
                fileMeta: {
                    fileName: "a",
                    projectName: "b",
                    apiVersion: "1.1"
                },
                map: {
                    name: "a node",
                    type: "File",
                    attributes: {}
                },
                settings: {
                    fileSettings: {}
                }
            };

            NodeDecorator.decorateMapWithUnaryMetric(cm);

            let h = d3.hierarchy(cm.map);

            h.each((node)=>{
                expect(node.data.attributes["unary"]).toBeDefined();
            });

        });

        it("all nodes should have a unary attribute", ()=>{
            fileA.map.children[0].attributes = {};
            NodeDecorator.decorateMapWithUnaryMetric(fileA);
            let h = d3.hierarchy(fileA.map);
            h.each((node)=>{
                expect(node.data.attributes["unary"]).toBeDefined();
            });
        });

    });


    describe("decorateMapWithPathAttribute",() => {

        it("should have the correct path", ()=>{

            let cm: CCFile = {
                fileMeta: {
                    fileName: "a",
                    projectName: "b",
                    apiVersion: "1.1"
                },
                map: {
                    name: "a node",
                    type: "Folder",
                    attributes: {},
                    children: [
                        {
                            name: "b node",
                            type: "File",
                            attributes: {}
                        },
                        {
                            name: "c node",
                            type: "Folder",
                            attributes: {},
                            children: [
                                {
                                    name: "d node",
                                    type: "File",
                                    attributes: {}
                                }
                            ]
                        }
                    ]
                },
                settings: {
                    fileSettings: {}
                }
            };

            NodeDecorator.decorateMapWithPathAttribute(cm);

            let h = d3.hierarchy(cm.map);

            h.each((node)=>{
                expect(node.data.path).toBeDefined();
            });

            expect(cm.map.path).toBe("/a node");
            expect(cm.map.children[1].children[0].path).toBe("/a node/c node/d node");

        });


    });

});

