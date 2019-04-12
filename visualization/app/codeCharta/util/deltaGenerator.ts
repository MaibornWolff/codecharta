import * as d3 from "d3";
import {HierarchyNode} from "d3-hierarchy";
import * as deepcopy from "deepcopy";
import {CodeMapNode, CCFile, KeyValuePair} from "../codeCharta.model";

export class DeltaGenerator {

    public static getDeltaFile(referenceFile: CCFile, comparisonFile: CCFile): CCFile {
        if(referenceFile && comparisonFile && referenceFile.map && comparisonFile.map) {
            //build hash maps for fast search indices
            let referenceHashMap = new Map<string, CodeMapNode>();
            d3.hierarchy(referenceFile.map).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
                referenceHashMap.set(node.data.path, node.data);
            });

            let comparisonHashMap = new Map<string, CodeMapNode>();
            d3.hierarchy(comparisonFile.map).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
                comparisonHashMap.set(node.data.path, node.data);
            });

            //insert nodes from the other map
            this.insertNodesIntoMapsAndHashMaps(referenceHashMap, comparisonHashMap, comparisonFile.map);
            this.insertNodesIntoMapsAndHashMaps(comparisonHashMap, referenceHashMap, referenceFile.map);

            //calculate deltas between leaves
            referenceHashMap.forEach((referenceNode, path) => {
                let comparisonNode = comparisonHashMap.get(path);
                comparisonNode.deltas = this.calculateAttributeListDelta(referenceNode.attributes, comparisonNode.attributes);
                referenceNode.deltas = this.calculateAttributeListDelta(comparisonNode.attributes, referenceNode.attributes);
            });
        }
        return referenceFile
    }

    private static insertNodesIntoMapsAndHashMaps(firstLeafHashMap: Map<string, CodeMapNode>, secondLeafHashMap: Map<string, CodeMapNode>, secondMap: CodeMapNode) {
        firstLeafHashMap.forEach((node, path) => {
            if (!secondLeafHashMap.has(path)) {
                let addedNode = this.deepcopy(node);
                secondLeafHashMap.set(path, addedNode);
                this.insertNodeIntoMapByPath(addedNode, secondMap);
            }
        });
    }

    private static insertNodeIntoMapByPath(node: CodeMapNode, insertMap: CodeMapNode) {

        let pathArray: string[] = node.path.split("/");

        let insertPathArray: string[] = pathArray.slice(2, pathArray.length - 1);
        let currentPathArray: string[] = pathArray.slice(0, 2);
        let current = insertMap;


        while (insertPathArray.length > 0) {

            let childFoundSteppingIntoIt = false;

            if (current.children) {

                for (let i = 0; i < current.children.length && !childFoundSteppingIntoIt; i++) {
                    let child = current.children[i];
                    if (child.name === insertPathArray[0]) {
                        // step into existing folder
                        current = child;
                        currentPathArray.push(insertPathArray[0]);
                        insertPathArray = insertPathArray.slice(1);
                        childFoundSteppingIntoIt = true;
                    }
                }

            } else {
                current.children = [];
            }

            if (!childFoundSteppingIntoIt) {
                //create new folder and start again
                currentPathArray.push(insertPathArray[0]);

                let folder = {
                    name: insertPathArray[0],
                    path: currentPathArray.join("/"),
                    type: "Folder",
                    children: [],
                    origin: node.origin,
                    visible: true,
                    attributes: {}
                };

                folder.attributes["unary"] = 1; // TODO: do we need this, if we decorate afterwards nevertheless?

                current.children.push(folder);
                current = folder;


                insertPathArray = insertPathArray.slice(1);
            }

        }

        // insert node
        if (!current.children) {
            current.children = [];
        }
        current.children.push(node);

    }

    private static deepcopy(root:CodeMapNode): CodeMapNode {

        //deepcopy
        let h = d3.hierarchy(root);
        let copy: HierarchyNode<CodeMapNode> = deepcopy.default(h.copy()); //Hm this seems to be doing the right thing. First shallow copy then a deep copy ?!

        //make own attributes 0 (not unary)
        for (let property in copy.data.attributes) {
            if (copy.data.attributes.hasOwnProperty(property)) {
                copy.data.attributes[property] = 0;
            }
        }

        copy.data.attributes.unary = 1; // TODO: do we need this, if we decorate afterwards nevertheless?

        ////make all ancestors attributes 0
        copy.each((node) => {
            for (let property in node.data.attributes) {
                if (node.data.attributes.hasOwnProperty(property)) {
                    node.data.attributes[property] = 0;
                }
            }
            copy.data.attributes.unary = 1;
        });

        return copy.data;

    }

    private static calculateAttributeListDelta(first: KeyValuePair, second: KeyValuePair) {
        let deltas = {};
        for (let key in second) {
            if (key) {
                let firstValue = first[key] ? first[key] : 0; //assume zero if no value in first
                let secondValue = second[key];
                let delta = secondValue - firstValue;
                deltas[key] = delta;
            }
        }
        return deltas;
    }
}
