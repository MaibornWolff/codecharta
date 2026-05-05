import { NodeType } from "../../../../codeCharta.model"

export const rootNode = {
    name: "root",
    path: "/root",
    id: 0,
    attributes: { unary: 2 },
    type: NodeType.FOLDER,
    isExcluded: false,
    isFlattened: false,
    children: [
        {
            name: "bigLeaf",
            path: "/root/bigLeaf",
            id: 1,
            type: NodeType.FILE,
            attributes: {},
            isExcluded: false,
            isFlattened: false
        },
        {
            name: "ParentLeaf",
            path: "/root/ParentLeaf",
            id: 2,
            type: NodeType.FOLDER,
            attributes: { unary: 1 },
            isExcluded: false,
            isFlattened: false,
            children: [
                {
                    name: "smallLeaf",
                    path: "/root/ParentLeaf/smallLeaf",
                    id: 3,
                    type: NodeType.FILE,
                    attributes: {},
                    isExcluded: false,
                    isFlattened: false
                }
            ]
        }
    ]
}
