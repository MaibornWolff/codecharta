import {CodeMap} from "../data/model/CodeMap";

export const VALID_TEST_DATA: CodeMap = {
    fileName: "file",
    projectName: "project",
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
                        attributes: {"rloc": 30, "functions": 100, "mcc": 100},
                        children: []
                    },
                    {
                        name: "other small leaf",
                        type: "File",
                        attributes: {"rloc": 70, "functions": 1000, "mcc": 10},
                        children: []
                    }
                ]
            }
        ]
    }
};
