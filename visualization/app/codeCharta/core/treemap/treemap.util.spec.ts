import {TreeMapUtils} from "./treemap.util";
import {SquarifiedValuedCodeMapNode} from "./treemap.service";
import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
describe("treemap utils", () => {

    describe("build node", () => {

        let codeMapNode: CodeMapNode;
        let squaredNode: SquarifiedValuedCodeMapNode;

        let heightScale = 1;
        let heightValue = 100;
        let depth = 0;
        let parent = null;
        let heightKey = "theHeight";
        let minHeight = 1;
        let folderHeight = 2;
        let invertHeight = false;
        let maxHeight = 2000;

        beforeEach(() => {

            codeMapNode = {
                name: "Anode",
                attributes: {}
            }

            squaredNode = {
                data: codeMapNode,
                value: 42,
                x0: 0,
                y0: 0,
                x1: 400,
                y1: 400,
            }

        });

        function buildNode() {
            return TreeMapUtils.buildNodeFrom(
                squaredNode,
                heightScale,
                heightValue,
                depth,
                parent,
                heightKey,
                minHeight,
                folderHeight,
                invertHeight,
                maxHeight
            );
        }

        it("minimal", () => {
            expect(buildNode()).toMatchSnapshot();
        });

        it("invertHeight", () => {
            invertHeight = true;
            expect(buildNode()).toMatchSnapshot();
        });

        it("deltas", () => {
            squaredNode.data.deltas = {};
            squaredNode.data.deltas[heightKey] = 33;
            expect(buildNode()).toMatchSnapshot();
            squaredNode.data.deltas = undefined;
        });

        it("is leaf", () => {
            let tmp = TreeMapUtils.isNodeLeaf;
            TreeMapUtils.isNodeLeaf = jest.fn();
            TreeMapUtils.isNodeLeaf.mockReturnValue(true);
            expect(buildNode()).toMatchSnapshot();
            TreeMapUtils.isNodeLeaf = tmp;
        });

    });

    describe("detect leaves", () => {

        it("root with no children is leaf", () => {
            const root = {};
            expect(TreeMapUtils.isNodeLeaf(root)).toBeTruthy();
        });

        it("root plus child should not be a leaf", () => {
            const root = {children: [{}]};
            expect(TreeMapUtils.isNodeLeaf(root)).toBeFalsy();
            expect(TreeMapUtils.isNodeLeaf(root.children[0])).toBeTruthy();
        });

        it("root plus child in child", () => {
            const root = {children: [{children: [{}]}]};
            expect(TreeMapUtils.isNodeLeaf(root)).toBeFalsy();
            expect(TreeMapUtils.isNodeLeaf(root.children[0])).toBeFalsy();
            expect(TreeMapUtils.isNodeLeaf(root.children[0].children[0])).toBeTruthy();
        });

        it("root plus two children", () => {
            const root = {children: [{}, {}]};
            expect(TreeMapUtils.isNodeLeaf(root)).toBeFalsy();
            expect(TreeMapUtils.isNodeLeaf(root.children[0])).toBeTruthy();
            expect(TreeMapUtils.isNodeLeaf(root.children[1])).toBeTruthy();
        });

    });

    describe("count nodes", () => {

        it("root only should be 1", () => {
            const root = {};
            expect(TreeMapUtils.countNodes(root)).toBe(1);
        });

        it("root plus child should be 2", () => {
            const root = {children: [{}]};
            expect(TreeMapUtils.countNodes(root)).toBe(2);
        });

        it("root plus child in child should be 3", () => {
            const root = {children: [{children: [{}]}]};
            expect(TreeMapUtils.countNodes(root)).toBe(3);
        });

        it("root plus two children should be 3", () => {
            const root = {children: [{}, {}]};
            expect(TreeMapUtils.countNodes(root)).toBe(3);
        });

    });

}