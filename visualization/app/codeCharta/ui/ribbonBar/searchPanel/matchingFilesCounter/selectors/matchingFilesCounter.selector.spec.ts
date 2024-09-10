import { NodeType, CodeMapNode, BlacklistItem } from "../../../../../codeCharta.model"
import { _calculateMatchingFilesCounter } from "./matchingFilesCounter.selector"

describe("matchingFilesCounterSelector", () => {
    it("should calculate matching files counter", () => {
        const blacklist: BlacklistItem[] = [
            { path: "big Leaf", type: "exclude" },
            { path: "small leaf", type: "flatten" }
        ]
        const searchedNodes: CodeMapNode[] = [
            { name: "small leaf", type: NodeType.FILE, path: "/root/Parent Leaf/small leaf" },
            { name: "other small leaf", type: NodeType.FILE, path: "/root/Parent Leaf/other small leaf" }
        ]
        const codeMapNodes: CodeMapNode[] = [
            ...searchedNodes,
            { name: "big leaf", type: NodeType.FILE, path: "/root/big leaf", link: "https://www.google.de" }
        ]
        expect(_calculateMatchingFilesCounter(searchedNodes, blacklist, codeMapNodes)).toEqual({
            excludeCount: "0/1",
            fileCount: "2/3",
            flattenCount: "1/1"
        })
    })
})
