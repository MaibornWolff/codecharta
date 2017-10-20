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