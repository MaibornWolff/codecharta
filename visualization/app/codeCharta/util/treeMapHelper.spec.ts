import {TreeMapHelper} from "./treeMapHelper";
import {SquarifiedValuedCodeMapNode} from "./treeMapGenerator";
import {CodeMapNode, Settings} from "../codeCharta.model";
import {SETTINGS} from './dataMocks'

describe("treeMapHelper", () => {

    describe("build node", () => {

        let codeMapNode: CodeMapNode;
        let squaredNode: SquarifiedValuedCodeMapNode;
        let settings

        let heightScale = 1;
        let heightValue = 100;
        let depth = 0;
        let parent = null;
        let minHeight = 1;
        let folderHeight = 2;
        let maxHeight = 2000;

        beforeEach(() => {

            codeMapNode = {
                name: "Anode",
                path: "/root/Anode",
                type: "File",
                attributes: {}
            } as CodeMapNode;

            squaredNode = {
                data: codeMapNode,
                value: 42,
                x0: 0,
                y0: 0,
                x1: 400,
                y1: 400
            } as SquarifiedValuedCodeMapNode;

            settings = SETTINGS
            settings.treeMapSettings.mapSize = 1
            settings.dynamicSettings.margin = 15
            settings.appSettings.invertHeight = false

        });

        function buildNode() {
            return TreeMapHelper.buildNodeFrom(
                squaredNode,
                heightScale,
                heightValue,
                maxHeight,
                depth,
                parent,
                settings,
                minHeight,
                folderHeight
            );
        }

        it("minimal", () => {
            expect(buildNode()).toMatchSnapshot();
        });

        it("invertHeight", () => {
            settings.appSettings.invertHeight = true;
            expect(buildNode()).toMatchSnapshot();
        });

        it("deltas", () => {
            squaredNode.data.deltas = {};
            settings.dynamicSettings.heightMetric = "theHeight"
            squaredNode.data.deltas[settings.dynamicSettings.heightMetric] = 33;
            expect(buildNode()).toMatchSnapshot();
            squaredNode.data.deltas = undefined;
        });

        it("given negative deltas the resulting heightDelta also should be negative", () => {
            squaredNode.data.deltas = {};
            squaredNode.data.deltas[settings.dynamicSettings.heightMetric] = -33;
            expect(buildNode().heightDelta).toBe(-33);
            squaredNode.data.deltas = undefined;
        });

        it("is leaf", () => {
            let tmp = TreeMapHelper.isNodeLeaf;
            TreeMapHelper.isNodeLeaf = jest.fn(() => {return true});
            expect(buildNode()).toMatchSnapshot();
            TreeMapHelper.isNodeLeaf = tmp;
        });

        it("should set lowest possible height caused by other visible edge pairs", () => {
            settings.fileSettings.edges = [{
                fromNodeName: "/root/AnotherNode1",
                toNodeName: "/root/AnotherNode2",
                attributes: {
                    pairingRate: 33,
                    avgCommits: 12
                },
                visible: true,
            }];
            expect(buildNode()).toMatchSnapshot();
        });

        it("should set markingColor according to markedPackages", () => {
            const color = "#FF0000";
            settings.fileSettings.markedPackages = [{
                path: "/root/Anode",
                color: color,
                attributes: {},
            }];
            expect(buildNode().markingColor).toEqual(color);
        });

        it("should set no markingColor according to markedPackages", () => {
            const color = "#FF0000";
            settings.fileSettings.markedPackages = [{
                path: "/root/AnotherNode",
                color: color,
                attributes: {},
            }];
            expect(buildNode().markingColor).toEqual(null);
        });
    });

    describe("detect leaves", () => {

        it("root with no children is leaf", () => {
            const root = {};
            expect(TreeMapHelper.isNodeLeaf(root)).toBeTruthy();
        });

        it("root plus child should not be a leaf", () => {
            const root = {children: [{}]};
            expect(TreeMapHelper.isNodeLeaf(root)).toBeFalsy();
            expect(TreeMapHelper.isNodeLeaf(root.children[0])).toBeTruthy();
        });

        it("root plus child in child", () => {
            const root = {children: [{children: [{}]}]};
            expect(TreeMapHelper.isNodeLeaf(root)).toBeFalsy();
            expect(TreeMapHelper.isNodeLeaf(root.children[0])).toBeFalsy();
            expect(TreeMapHelper.isNodeLeaf(root.children[0].children[0])).toBeTruthy();
        });

        it("root plus two children", () => {
            const root = {children: [{}, {}]};
            expect(TreeMapHelper.isNodeLeaf(root)).toBeFalsy();
            expect(TreeMapHelper.isNodeLeaf(root.children[0])).toBeTruthy();
            expect(TreeMapHelper.isNodeLeaf(root.children[1])).toBeTruthy();
        });

    });

    describe("count nodes", () => {

        it("root only should be 1", () => {
            const root = {};
            expect(TreeMapHelper.countNodes(root)).toBe(1);
        });

        it("root plus child should be 2", () => {
            const root = {children: [{}]};
            expect(TreeMapHelper.countNodes(root)).toBe(2);
        });

        it("root plus child in child should be 3", () => {
            const root = {children: [{children: [{}]}]};
            expect(TreeMapHelper.countNodes(root)).toBe(3);
        });

        it("root plus two children should be 3", () => {
            const root = {children: [{}, {}]};
            expect(TreeMapHelper.countNodes(root)).toBe(3);
        });

    });

    describe("isNodeToBeFlat", () => {

        let codeMapNode: CodeMapNode;
        let squaredNode: SquarifiedValuedCodeMapNode;
        let treeMapSettings: Settings

        beforeEach(() => {

            codeMapNode = {
                name: "Anode",
                path: "/root/Anode",
                type: "File",
                attributes: {}
            } as CodeMapNode;

            squaredNode = {
                data: codeMapNode,
                value: 42,
                x0: 0,
                y0: 0,
                x1: 400,
                y1: 400
            } as SquarifiedValuedCodeMapNode;

            treeMapSettings = SETTINGS
            treeMapSettings.treeMapSettings.mapSize = 1
            treeMapSettings.dynamicSettings.margin = 15

        });

        it("should not be a flat node when no visibleEdges", () => {
            treeMapSettings.fileSettings.edges = [];
            expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy();
        });

        it("should be a flat node when other edges are visible", () => {
            treeMapSettings.fileSettings.edges = [{
                fromNodeName: "/root/anotherNode",
                toNodeName: "/root/anotherNode2",
                attributes: {},
                visible: true
            }];
            expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeTruthy();
        });

        it("should not be a flat node when it contains edges", () => {
            treeMapSettings.fileSettings.edges = [{
                fromNodeName: "/root/Anode",
                toNodeName: "/root/anotherNode",
                attributes: {}
            }];
            expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy();
        });

        it("should not be a flat node, because its searched for", () => {
            treeMapSettings.dynamicSettings.searchedNodePaths = ["/root/Anode"];
            treeMapSettings.dynamicSettings.searchPattern = "Anode";
            expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy();
        });

        it("should be a flat node, because other nodes are searched for", () => {
            treeMapSettings.dynamicSettings.searchedNodePaths = ["/root/anotherNode", "/root/anotherNode2"];
            treeMapSettings.dynamicSettings.searchPattern = "Anode";
            expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeTruthy();
        });

        it("should not be a flat node when searchPattern is empty", () => {
            treeMapSettings.dynamicSettings.searchedNodePaths = ["/root/anotherNode", "/root/anotherNode2"];
            treeMapSettings.dynamicSettings.searchPattern = "";
            expect(TreeMapHelper["isNodeToBeFlat"](squaredNode, treeMapSettings)).toBeFalsy();
        });

    });

});