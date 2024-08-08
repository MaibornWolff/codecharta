import { aggregateRiskProfile, getPercentagesOfRiskProfile, RiskProfile } from "./riskProfileHelper"
import { CodeMapNode, NodeType } from "../../../../../codeCharta.model"
import { metricThresholdsByLanguage } from "./artificialIntelligence.metricThresholds"

describe("riskProfileHelper", () => {
    it("should calculate risk profile for java files", () => {
        const actualRlocRisk: RiskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
        const fileExtension = "java"
        const nodes: CodeMapNode[] = [
            { name: "javaFile1", type: NodeType.FILE, attributes: { rloc: 1, complexity: 48 } },
            { name: "javaFile2", type: NodeType.FILE, attributes: { rloc: 10, complexity: 71 } },
            { name: "javaFile3", type: NodeType.FILE, attributes: { rloc: 100, complexity: 117 } },
            { name: "javaFile4", type: NodeType.FILE, attributes: { rloc: 1000, complexity: 191 } }
        ]

        for (const node of nodes) {
            aggregateRiskProfile(node, actualRlocRisk, fileExtension)
        }

        expect(actualRlocRisk).toEqual({ lowRisk: 1, moderateRisk: 10, highRisk: 100, veryHighRisk: 1000 })
    })

    it("should calculate risk profile for all occurring programming languages in files", () => {
        const actualRiskProfile: RiskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
        const fileExtensions = ["java", "java", "java", "ts"]
        const nodes: CodeMapNode[] = [
            {
                name: "javaFile1",
                type: NodeType.FILE,
                attributes: { rloc: 1, complexity: metricThresholdsByLanguage.java["complexity"].percentile70 }
            },
            {
                name: "javaFile2",
                type: NodeType.FILE,
                attributes: { rloc: 10, complexity: metricThresholdsByLanguage.java["complexity"].percentile80 }
            },
            {
                name: "javaFile3",
                type: NodeType.FILE,
                attributes: { rloc: 100, complexity: metricThresholdsByLanguage.java["complexity"].percentile90 }
            },
            {
                name: "tsFile",
                type: NodeType.FILE,
                attributes: { rloc: 1000, complexity: metricThresholdsByLanguage.miscellaneous["complexity"].percentile90 }
            }
        ]

        for (const [index, node] of nodes.entries()) {
            aggregateRiskProfile(node, actualRiskProfile, fileExtensions[index])
        }

        expect(actualRiskProfile).toEqual({ lowRisk: 1, moderateRisk: 10, highRisk: 1100, veryHighRisk: 0 })
    })

    it("should get percentages of risk profile", () => {
        const rlocRisk: RiskProfile = { lowRisk: 1000, moderateRisk: 0, highRisk: 0, veryHighRisk: 1000 }
        const totalRloc = Object.values(rlocRisk).reduce((a, b) => a + b)
        const veryHighRiskRloc = totalRloc - rlocRisk.veryHighRisk
        const veryHighRisk = Math.round((veryHighRiskRloc / totalRloc) * 100)
        const expectedRiskProfile = { highRisk: 0, lowRisk: 100 - veryHighRisk, moderateRisk: 0, veryHighRisk }

        const actualRiskProfile = getPercentagesOfRiskProfile(rlocRisk)

        expect(actualRiskProfile).toEqual(expectedRiskProfile)
    })

    it("should calculate risk profile when first available metric (complexity) is not defined for the map", () => {
        const actualRlocRisk: RiskProfile = { lowRisk: 0, moderateRisk: 0, highRisk: 0, veryHighRisk: 0 }
        const fileExtension = "java"
        const nodes: CodeMapNode[] = [
            { name: "javaFile1", type: NodeType.FILE, attributes: { rloc: 1, mcc: 48 } },
            { name: "javaFile2", type: NodeType.FILE, attributes: { rloc: 10, mcc: 71 } },
            { name: "javaFile3", type: NodeType.FILE, attributes: { rloc: 100, mcc: 117 } },
            { name: "javaFile4", type: NodeType.FILE, attributes: { rloc: 1000, mcc: 191 } }
        ]

        for (const node of nodes) {
            aggregateRiskProfile(node, actualRlocRisk, fileExtension)
        }

        expect(actualRlocRisk).toEqual({ lowRisk: 1, moderateRisk: 10, highRisk: 100, veryHighRisk: 1000 })
    })
})
