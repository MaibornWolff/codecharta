import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"
import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { VALID_NODE_WITH_PATH_AND_EXTENSION, VALID_NODE_WITHOUT_RLOC_METRIC, setIsBlacklisted } from "../../../util/dataMocks"
import { clone } from "../../../util/clone"

describe("FileExtensionCalculator", () => {
    let map: CodeMapNode

    beforeEach(() => {
        map = clone(VALID_NODE_WITH_PATH_AND_EXTENSION)
    })

    describe("getFileExtensionDistribution", () => {
        it("should get correct absolute distribution of file-extensions for given metric", () => {
            const expected: MetricDistribution[] = [
                { fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 42.970_822_281_167_11, color: "hsl(58, 60%, 50%)" },
                { fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.482_758_620_689_66, color: "hsl(321, 60%, 50%)" },
                { fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.567_639_257_294_43, color: "hsl(232, 60%, 50%)" },
                {
                    fileExtension: "None",
                    absoluteMetricValue: 15,
                    relativeMetricValue: 3.978_779_840_848_806_4,
                    color: "#676867"
                }
            ]

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct absolute distribution of file-extensions for given metric with hidden node", () => {
            setIsBlacklisted([map.children[0].path], map, "flatten")

            const expected: MetricDistribution[] = [
                { fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 42.970_822_281_167_11, color: "hsl(58, 60%, 50%)" },
                { fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.482_758_620_689_66, color: "hsl(321, 60%, 50%)" },
                { fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.567_639_257_294_43, color: "hsl(232, 60%, 50%)" },
                {
                    fileExtension: "None",
                    absoluteMetricValue: 15,
                    relativeMetricValue: 3.978_779_840_848_806_4,
                    color: "#676867"
                }
            ]

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct absolute distribution of file-extensions for given metric with excluded node", () => {
            setIsBlacklisted([map.children[0].path], map, "exclude")

            const expected: MetricDistribution[] = [
                { fileExtension: "java", absoluteMetricValue: 162, relativeMetricValue: 58.483_754_512_635_38, color: "hsl(58, 60%, 50%)" },
                {
                    fileExtension: "json",
                    absoluteMetricValue: 70,
                    relativeMetricValue: 25.270_758_122_743_683,
                    color: "hsl(232, 60%, 50%)"
                },
                { fileExtension: "jpg", absoluteMetricValue: 30, relativeMetricValue: 10.830_324_909_747_292, color: "hsl(321, 60%, 50%)" },
                { fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: 5.415_162_454_873_646, color: "#676867" }
            ]

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct absolute distribution of file-extensions for given metric with excluded path", () => {
            setIsBlacklisted(["/root/another big leaf.java", "/root/Parent Leaf/another leaf.java"], map, "exclude")

            const expected: MetricDistribution[] = [
                { fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 60.465_116_279_069_77, color: "hsl(321, 60%, 50%)" },
                { fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 32.558_139_534_883_72, color: "hsl(232, 60%, 50%)" },
                { fileExtension: "None", absoluteMetricValue: 15, relativeMetricValue: 6.976_744_186_046_512, color: "#676867" }
            ]

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct relative distribution of file-extensions for given metric", () => {
            const expected: MetricDistribution[] = [
                {
                    fileExtension: "java",
                    absoluteMetricValue: 162,
                    relativeMetricValue: 42.970_822_281_167_11,
                    color: "hsl(58, 60%, 50%)"
                },
                { fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 34.482_758_620_689_66, color: "hsl(321, 60%, 50%)" },
                { fileExtension: "json", absoluteMetricValue: 70, relativeMetricValue: 18.567_639_257_294_43, color: "hsl(232, 60%, 50%)" },
                {
                    fileExtension: "None",
                    absoluteMetricValue: 15,
                    relativeMetricValue: 3.978_779_840_848_806_4,
                    color: "#676867"
                }
            ]

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct get Array with just a None Attribute, if no Extension is found for the Metric", () => {
            map = VALID_NODE_WITHOUT_RLOC_METRIC

            const expected: MetricDistribution[] = [
                { fileExtension: "None", absoluteMetricValue: null, relativeMetricValue: 100, color: "#676867" }
            ]

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct distribution of file-extensions for given metric using other-grouping", () => {
            const additionalChildren: CodeMapNode[] = [
                {
                    name: "child1.txt",
                    type: NodeType.FILE,
                    path: "/root/child1.txt",
                    attributes: { rloc: 2 },
                    isExcluded: false,
                    isFlattened: false
                },
                {
                    name: "child2.kt",
                    type: NodeType.FILE,
                    path: "/root/child2.kt",
                    attributes: { rloc: 4 },
                    isExcluded: false,
                    isFlattened: false
                },
                {
                    name: "child3.ts",
                    type: NodeType.FILE,
                    path: "/root/child3.ts",
                    attributes: { rloc: 6 },
                    isExcluded: false,
                    isFlattened: false
                },
                {
                    name: "child4.xml",
                    type: NodeType.FILE,
                    path: "/root/child4.xml",
                    attributes: { rloc: 8 },
                    isExcluded: false,
                    isFlattened: false
                }
            ]
            const expected: MetricDistribution[] = [
                {
                    fileExtension: "java",
                    absoluteMetricValue: 162,
                    relativeMetricValue: 40.806_045_340_050_375,
                    color: "hsl(58, 60%, 50%)"
                },
                { fileExtension: "jpg", absoluteMetricValue: 130, relativeMetricValue: 32.745_591_939_546_6, color: "hsl(321, 60%, 50%)" },
                {
                    fileExtension: "json",
                    absoluteMetricValue: 70,
                    relativeMetricValue: 17.632_241_813_602_015,
                    color: "hsl(232, 60%, 50%)"
                },
                {
                    fileExtension: "None",
                    absoluteMetricValue: 15,
                    relativeMetricValue: 3.778_337_531_486_146_3,
                    color: "#676867"
                },
                { fileExtension: "xml", absoluteMetricValue: 8, relativeMetricValue: 2.015_113_350_125_944_6, color: "hsl(7, 60%, 50%)" },
                {
                    fileExtension: "other",
                    absoluteMetricValue: 12,
                    relativeMetricValue: 3.022_670_025_188_916_5,
                    color: "#676867"
                }
            ]
            map.children.push(...additionalChildren)
            FileExtensionCalculator["OTHER_GROUP_THRESHOLD_VALUE"] = 2

            const result: MetricDistribution[] = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })
    })

    describe("estimateFileExtension", () => {
        it("should return correct lower-cased file extension", () => {
            const fileName = "fileName.JAVA"
            const result = FileExtensionCalculator["estimateFileExtension"](fileName)
            expect(result).toEqual("java")
        })

        it("should return correct file extension when filename contains multiple points", () => {
            const fileName = "prefix.name.suffix.json"
            const result = FileExtensionCalculator["estimateFileExtension"](fileName)
            expect(result).toEqual("json")
        })

        it("should return 'none' as extension, as there does not exist any", () => {
            const fileName = "name_without_extension"
            const result = FileExtensionCalculator["estimateFileExtension"](fileName)
            expect(result).toEqual("None")
        })
    })
})
