import { calculate } from "./artificialIntelligence.selector"
import { VALID_NODE_JAVA } from "../../../../util/dataMocks"
import { BlacklistItem, NodeType } from "../../../../codeCharta.model"

describe("ArtificialIntelligenceSelector", () => {
    it("should return undefined when no unifiedMapNode is available", () => {
        const actual = calculate({ unifiedMapNode: undefined }, [])

        expect(actual).toBeUndefined()
    })

    it("should calculate suspicious metrics and risk profile when experimental features are enabled ", () => {
        const actual = calculate({ unifiedMapNode: VALID_NODE_JAVA }, [])

        expect(actual).toEqual({
            analyzedProgrammingLanguage: "java",
            riskProfile: { highRisk: 37, lowRisk: 46, moderateRisk: 17, veryHighRisk: 0 },
            suspiciousMetricSuggestionLinks: [
                { from: 365, isOutlier: true, metric: "loc", to: 554, outlierThreshold: 1001 },
                { from: 29, isOutlier: true, metric: "functions", to: 44, outlierThreshold: 75 },
                { from: 48, metric: "complexity", to: 71 }
            ],
            unsuspiciousMetrics: ["rloc (Real Lines of Code)"],
            untrackedMetrics: []
        })
    })

    it("should return untracked metrics", () => {
        VALID_NODE_JAVA.children[0].children.map(object => {
            object.attributes.unknownMetric = 2569
        })
        const actual = calculate({ unifiedMapNode: VALID_NODE_JAVA }, [])

        expect(actual).toEqual({
            analyzedProgrammingLanguage: "java",
            riskProfile: { highRisk: 37, lowRisk: 46, moderateRisk: 17, veryHighRisk: 0 },
            suspiciousMetricSuggestionLinks: [
                { from: 365, isOutlier: true, metric: "loc", to: 554, outlierThreshold: 1001 },
                { from: 29, isOutlier: true, metric: "functions", to: 44, outlierThreshold: 75 },
                { from: 48, metric: "complexity", to: 71 }
            ],
            unsuspiciousMetrics: ["rloc (Real Lines of Code)"],
            untrackedMetrics: ["unknownMetric"]
        })
    })

    it("should ignore excluded nodes", () => {
        const blacklist: BlacklistItem[] = [{ path: "file1.java", type: "exclude" }]
        const blacklistedNode = {
            name: "file1.java",
            path: "file1.java",
            type: NodeType.FILE,
            attributes: { rloc: 70, mcc: 1000 }
        }

        const actual = calculate({ unifiedMapNode: blacklistedNode }, blacklist)

        expect(actual).toEqual({
            riskProfile: undefined,
            suspiciousMetricSuggestionLinks: [],
            unsuspiciousMetrics: [],
            untrackedMetrics: []
        })
    })
})
