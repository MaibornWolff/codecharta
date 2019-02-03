import {CodeMap, CodeMapNode, Edge} from "./model/CodeMap";

export const VALID_NODE: CodeMapNode = {
    name: "root",
    attributes: {},
    type: "Folder",
    children: [
        {
            name: "big leaf",
            type: "File",
            attributes: {"RLOC": 100, "Functions": 10, "MCC": 1},
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
                    attributes: {"RLOC": 30, "Functions": 100, "MCC": 100}
                },
                {
                    name: "other small leaf",
                    type: "File",
                    attributes: {"RLOC": 70, "Functions": 1000, "MCC": 10}
                }
            ]
        }
    ]
};

export const VALID_EDGE: Edge[] = [
    {
        fromNodeName: "/root/big leaf",
        toNodeName: "/root/Parent Leaf/small leaf",
        attributes: {
            pairingRate: 89,
            avgCommits: 34
        }
    },
    {
        fromNodeName: "/root/sample1 only leaf",
        toNodeName: "/root/Parent Leaf/small leaf",
        attributes: {
            pairingRate: 89,
            avgCommits: 34
        }
    }
];

export const TEST_FILE_CONTENT = {
    projectName: "Sample Map",
    apiVersion: "1.1",
    nodes: [VALID_NODE]
};

export const TEST_FILE_DATA: CodeMap = {
    fileName: "file",
    projectName: "Sample Map",
    apiVersion: "1.1",
    nodes: VALID_NODE,
    edges: VALID_EDGE
};

export const TEST_DELTA_MAP_A: CodeMap = {
    fileName: "fileA",
    projectName: "Sample Project",
    apiVersion: "1.1",
    nodes: {
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
                        name: "small leaf",
                        type: "File",
                        attributes: {"rloc": 30, "functions": 100, "mcc": 100}
                    },
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

export const TEST_DELTA_MAP_B: CodeMap = {
    fileName: "fileB",
    projectName: "Sample Project",
    apiVersion: "1.1",
    nodes: {
        name: "root",
        type: "Folder",
        attributes: {},
        children: [
            {
                name: "big leaf",
                type: "File",
                attributes: {"rloc": 20, "functions": 10, "mcc": 1},
                link: "http://www.google.de"
            },
            {
                name: "additional leaf",
                type: "File",
                attributes: {"rloc": 10, "functions": 11, "mcc": 5},
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
                        attributes: {"rloc": 30, "functions": 100, "mcc": 100, "more": 20}
                    },
                    {
                        name: "other small leaf",
                        type: "File",
                        attributes: {"rloc": 70, "functions": 1000}
                    },
                    {
                        name: "big leaf",
                        type: "File",
                        attributes: {"rloc": 20, "functions": 10, "mcc": 1},
                        link: "http://www.google.de"
                    }
                ]
            }
        ]
    }
};