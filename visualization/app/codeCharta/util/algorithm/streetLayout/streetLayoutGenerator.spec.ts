import { StreetLayoutGenerator } from "./streetLayoutGenerator"
import { CodeMapNode, LayoutAlgorithm } from "../../../codeCharta.model"
import { klona } from "klona"
import { METRIC_DATA, STATE, VALID_NODE_WITH_PATH } from "../../../mocks/dataMocks"
import { createBlacklistMatcher } from "../../blacklist/blacklistMatcher"

describe("horizontalStreet", () => {
    let codeMapNode: CodeMapNode
    const matcher = createBlacklistMatcher([])

    beforeEach(() => {
        codeMapNode = klona(VALID_NODE_WITH_PATH)
        codeMapNode.path = "somePath"
    })
    describe("createStreetLayoutNodes", () => {
        it("should not call createTreeMap", () => {
            StreetLayoutGenerator.createStreetLayoutNodes(codeMapNode, STATE, METRIC_DATA, matcher, false)
            expect(StreetLayoutGenerator.createStreetLayoutNodes).toBeTruthy()
        })

        it("should call createTreeMap", () => {
            STATE.appSettings.layoutAlgorithm = LayoutAlgorithm.TreeMapStreet
            StreetLayoutGenerator.createStreetLayoutNodes(codeMapNode, STATE, METRIC_DATA, matcher, false)
            expect(StreetLayoutGenerator.createStreetLayoutNodes).toBeTruthy()
        })
    })
})
