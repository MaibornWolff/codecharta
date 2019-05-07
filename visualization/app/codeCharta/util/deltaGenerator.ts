import * as d3 from "d3";
import {CodeMapNode, CCFile, KeyValuePair, FileMeta} from "../codeCharta.model";
import _ from "lodash"
import {MapBuilder} from "./mapBuilder";

export class DeltaGenerator {

    public static getDeltaFile(referenceFile: CCFile, comparisonFile: CCFile): CCFile {
        let referenceHashMap: Map<string, CodeMapNode> = this.getCodeMapNodesAsHashMap(_.cloneDeep(referenceFile.map))
        let comparisonHashMap: Map<string, CodeMapNode> = this.getCodeMapNodesAsHashMap(_.cloneDeep(comparisonFile.map))
        let hashMapWithAllNodes: Map<string, CodeMapNode> = this.getHashMapWithAllNodes(referenceHashMap, comparisonHashMap)

        const fileMeta = this.getFileMetaData(referenceFile, comparisonFile)
        const map = MapBuilder.createCodeMapFromHashMap(hashMapWithAllNodes)
        return this.getNewCCFileWithDeltas(map, fileMeta)
    }

    private static getCodeMapNodesAsHashMap(rootNode: CodeMapNode): Map<string, CodeMapNode> {
        let hashMap = new Map<string, CodeMapNode>()

        d3.hierarchy(rootNode).descendants().map(x => x.data)
            .forEach((node: CodeMapNode) => {
                node.children = []
                hashMap.set(node.path, node)
            });
        return hashMap
    }

    private static getHashMapWithAllNodes(referenceHashMap: Map<string, CodeMapNode>, comparisonHashMap: Map<string, CodeMapNode>): Map<string, CodeMapNode>  {
        let hashMapWithAllNodes: Map<string, CodeMapNode> = new Map<string, CodeMapNode>()

        comparisonHashMap.forEach((comparisonNode: CodeMapNode, path: string) => {
            const referenceNode: CodeMapNode = referenceHashMap.get(path)
            if (referenceNode) {
                const newNode = this.getNewDeltaNode(referenceNode, referenceNode.attributes, comparisonNode.attributes)
                hashMapWithAllNodes.set(path, newNode)
            } else {
                const newNode = this.getNewDeltaNode(comparisonNode, {}, comparisonNode.attributes)
                hashMapWithAllNodes.set(path, newNode)
            }
        });

        referenceHashMap.forEach((referenceNode: CodeMapNode, path: string) => {
            if (!comparisonHashMap.get(path)) {
                const newNode = this.getNewDeltaNode(referenceNode, referenceNode.attributes, {})
                hashMapWithAllNodes.set(newNode.path, newNode)
            }
        })
        return hashMapWithAllNodes
    }

    private static getNewDeltaNode(node: CodeMapNode, referenceAttr: KeyValuePair, comparisonAttr: KeyValuePair): CodeMapNode {
        node.children = []
        node.deltas = this.getDeltaAttributeList(referenceAttr, comparisonAttr)
        node.attributes = comparisonAttr
        return node
    }

    private static getDeltaAttributeList(referenceAttr: KeyValuePair, comparisonAttr: KeyValuePair): KeyValuePair {
        let deltaAttr = {};

        _.keys(comparisonAttr).forEach((key: string) => {
            deltaAttr[key] = (referenceAttr[key]) ? comparisonAttr[key] - referenceAttr[key] : comparisonAttr[key]
        })

        _.keys(referenceAttr).forEach((key: string) => {
            if (!comparisonAttr[key]) {
                deltaAttr[key] = - referenceAttr[key];
            }
        })
        return deltaAttr;
    }

    private static getFileMetaData(referenceFile: CCFile, comparisonFile: CCFile): FileMeta {
        return {
            fileName: "Delta between " + referenceFile.fileMeta.fileName + ", " + comparisonFile.fileMeta.fileName,
            apiVersion: require("../../../package.json").codecharta.apiVersion,
            projectName: "Delta between " + referenceFile.fileMeta.projectName + ", " + comparisonFile.fileMeta.projectName,
        }
    }

    private static getNewCCFileWithDeltas(rootNode: CodeMapNode, fileMeta: FileMeta): CCFile {
        return {
            map: rootNode,
            fileMeta: fileMeta,
            settings: {
                fileSettings: {
                    edges: [],
                    blacklist: [],
                    attributeTypes: {},
                    markedPackages: []
                }
            }
        }
    }
}
