import {CodeMap} from "./model/CodeMap";

export const TEST_FILE_DATA: CodeMap = {

    fileName: "file",
    projectName: "Sample Map",
    root: {
        "name": "root",
        "attributes": {},
        "children": [
            {
                "name": "big leaf",
                "attributes": {"RLOC": 100, "Functions": 10, "MCC": 1},
                "link": "http://www.google.de"
            },
            {
                "name": "Parent Leaf",
                "attributes": {},
                "children": [
                    {
                        "name": "small leaf",
                        "attributes": {"RLOC": 30, "Functions": 100, "MCC": 100}
                    },
                    {
                        "name": "other small leaf",
                        "attributes": {"RLOC": 70, "Functions": 1000, "MCC": 10}
                    }
                ]
            }
        ]
    }

};

export const TEST_DELTA_MAP_A: CodeMap = {
    fileName: "fileA",
    projectName: "Sample Project",
    root: {
        "name": "root",
        "attributes": {},
        "children": [
            {
                "name": "big leaf",
                "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                "link": "http://www.google.de"
            },
            {
                "name": "Parent Leaf",
                "attributes": {},
                "children": [
                    {
                        "name": "small leaf",
                        "attributes": {"rloc": 30, "functions": 100, "mcc": 100}
                    },
                    {
                        "name": "other small leaf",
                        "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                    }
                ]
            }
        ]
    }
};

export const TEST_DELTA_MAP_B: CodeMap = {
    fileName: "fileB",
    projectName: "Sample Project",
    root: {
        "name": "root",
        "attributes": {},
        "children": [
            {
                "name": "big leaf",
                "attributes": {"rloc": 20, "functions": 10, "mcc": 1},
                "link": "http://www.google.de"
            },
            {
                "name": "additional leaf",
                "attributes": {"rloc": 10, "functions": 11, "mcc": 5},
                "link": "http://www.google.de"
            },
            {
                "name": "Parent Leaf",
                "attributes": {},
                "children": [
                    {
                        "name": "small leaf",
                        "attributes": {"rloc": 30, "functions": 100, "mcc": 100, "more": 20}
                    },
                    {
                        "name": "other small leaf",
                        "attributes": {"rloc": 70, "functions": 1000}
                    }
                ]
            }
        ]
    }
};