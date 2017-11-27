import {CodeMap} from "../data/model/CodeMap";

export const VALID_TEST_DATA: CodeMap = {
    fileName: "file",
    projectName: "project",
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
                        "attributes": {"rloc": 30, "functions": 100, "mcc": 100},
                        "children": []
                    },
                    {
                        "name": "other small leaf",
                        "attributes": {"rloc": 70, "functions": 1000, "mcc": 10},
                        "children": []
                    }
                ]
            }
        ]
    }
};
