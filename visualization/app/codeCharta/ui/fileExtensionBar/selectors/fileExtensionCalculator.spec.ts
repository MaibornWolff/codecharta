import { CategorizedMetricDistribution, FileExtensionCalculator } from "./fileExtensionCalculator"
import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { setIsBlacklisted, VALID_NODE_WITH_PATH_AND_EXTENSION, VALID_NODE_WITHOUT_RLOC_METRIC } from "../../../util/dataMocks"
import { clone } from "../../../util/clone"

describe("FileExtensionCalculator", () => {
    let map: CodeMapNode

    beforeEach(() => {
        map = clone(VALID_NODE_WITH_PATH_AND_EXTENSION)
    })

    describe("getFileExtensionDistribution", () => {
        it("should get correct absolute distribution of file-extensions for given metric", () => {
            const expected: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "java",
                        absoluteMetricValue: 162,
                        relativeMetricValue: 42.970_822_281_167_11,
                        color: "hsl(58, 60%, 50%)"
                    },
                    {
                        fileExtension: "jpg",
                        absoluteMetricValue: 130,
                        relativeMetricValue: 34.482_758_620_689_66,
                        color: "hsl(321, 60%, 50%)"
                    },
                    {
                        fileExtension: "json",
                        absoluteMetricValue: 70,
                        relativeMetricValue: 18.567_639_257_294_43,
                        color: "hsl(232, 60%, 50%)"
                    },
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.978_779_840_848_806_4,
                        color: "#676867"
                    }
                ],
                others: [],
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.978_779_840_848_806_4,
                        color: "#676867"
                    }
                ]
            }

            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct absolute distribution of file-extensions for given metric with hidden node", () => {
            setIsBlacklisted([map.children[0].path], map, "flatten")

            const expected: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "java",
                        absoluteMetricValue: 162,
                        relativeMetricValue: 42.970_822_281_167_11,
                        color: "hsl(58, 60%, 50%)"
                    },
                    {
                        fileExtension: "jpg",
                        absoluteMetricValue: 130,
                        relativeMetricValue: 34.482_758_620_689_66,
                        color: "hsl(321, 60%, 50%)"
                    },
                    {
                        fileExtension: "json",
                        absoluteMetricValue: 70,
                        relativeMetricValue: 18.567_639_257_294_43,
                        color: "hsl(232, 60%, 50%)"
                    },
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.978_779_840_848_806_4,
                        color: "#676867"
                    }
                ],
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.978_779_840_848_806_4,
                        color: "#676867"
                    }
                ],
                others: []
            }
            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct absolute distribution of file-extensions for given metric with excluded node", () => {
            setIsBlacklisted([map.children[0].path], map, "exclude")

            const expected: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "java",
                        absoluteMetricValue: 162,
                        relativeMetricValue: 58.483_754_512_635_38,
                        color: "hsl(58, 60%, 50%)"
                    },
                    {
                        fileExtension: "json",
                        absoluteMetricValue: 70,
                        relativeMetricValue: 25.270_758_122_743_683,
                        color: "hsl(232, 60%, 50%)"
                    },
                    {
                        fileExtension: "jpg",
                        absoluteMetricValue: 30,
                        relativeMetricValue: 10.830_324_909_747_292,
                        color: "hsl(321, 60%, 50%)"
                    },
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 5.415_162_454_873_646,
                        color: "#676867"
                    }
                ],
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 5.415_162_454_873_646,
                        color: "#676867"
                    }
                ],
                others: []
            }

            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct absolute distribution of file-extensions for given metric with excluded path", () => {
            setIsBlacklisted(["/root/another big leaf.java", "/root/Parent Leaf/another leaf.java"], map, "exclude")

            const expected: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "jpg",
                        absoluteMetricValue: 130,
                        relativeMetricValue: 60.465_116_279_069_77,
                        color: "hsl(321, 60%, 50%)"
                    },
                    {
                        fileExtension: "json",
                        absoluteMetricValue: 70,
                        relativeMetricValue: 32.558_139_534_883_72,
                        color: "hsl(232, 60%, 50%)"
                    },
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 6.976_744_186_046_512,
                        color: "#676867"
                    }
                ],
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 6.976_744_186_046_512,
                        color: "#676867"
                    }
                ],
                others: []
            }

            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct relative distribution of file-extensions for given metric", () => {
            const expected: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "java",
                        absoluteMetricValue: 162,
                        relativeMetricValue: 42.970_822_281_167_11,
                        color: "hsl(58, 60%, 50%)"
                    },
                    {
                        fileExtension: "jpg",
                        absoluteMetricValue: 130,
                        relativeMetricValue: 34.482_758_620_689_66,
                        color: "hsl(321, 60%, 50%)"
                    },
                    {
                        fileExtension: "json",
                        absoluteMetricValue: 70,
                        relativeMetricValue: 18.567_639_257_294_43,
                        color: "hsl(232, 60%, 50%)"
                    },
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.978_779_840_848_806_4,
                        color: "#676867"
                    }
                ],
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.978_779_840_848_806_4,
                        color: "#676867"
                    }
                ],
                others: []
            }

            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

            expect(result).toEqual(expected)
        })

        it("should get correct get Array with just a None Attribute, if no Extension is found for the Metric", () => {
            map = VALID_NODE_WITHOUT_RLOC_METRIC

            const expected: CategorizedMetricDistribution = {
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: null,
                        relativeMetricValue: 100,
                        color: "#676867"
                    }
                ],
                visible: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: null,
                        relativeMetricValue: 100,
                        color: "#676867"
                    }
                ],
                others: []
            }

            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

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
            map.children.push(...additionalChildren)

            const expected: CategorizedMetricDistribution = {
                visible: [
                    {
                        fileExtension: "java",
                        absoluteMetricValue: 162,
                        relativeMetricValue: 40.806045340050375,
                        color: "hsl(58, 60%, 50%)"
                    },
                    {
                        fileExtension: "jpg",
                        absoluteMetricValue: 130,
                        relativeMetricValue: 32.7455919395466,
                        color: "hsl(321, 60%, 50%)"
                    },
                    {
                        fileExtension: "json",
                        absoluteMetricValue: 70,
                        relativeMetricValue: 17.632241813602015,
                        color: "hsl(232, 60%, 50%)"
                    },
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.7783375314861463,
                        color: "#676867"
                    },
                    {
                        absoluteMetricValue: 20,
                        color: "#676867",
                        fileExtension: "other",
                        relativeMetricValue: 5.037783375314861
                    }
                ],
                none: [
                    {
                        fileExtension: "None",
                        absoluteMetricValue: 15,
                        relativeMetricValue: 3.7783375314861463,
                        color: "#676867"
                    }
                ],
                others: [
                    {
                        fileExtension: "xml",
                        absoluteMetricValue: 8,
                        relativeMetricValue: 2.0151133501259446,
                        color: "hsl(7, 60%, 50%)"
                    },
                    {
                        fileExtension: "ts",
                        absoluteMetricValue: 6,
                        relativeMetricValue: 1.5113350125944585,
                        color: "hsl(111, 60%, 50%)"
                    },
                    {
                        fileExtension: "kt",
                        absoluteMetricValue: 4,
                        relativeMetricValue: 1.0075566750629723,
                        color: "hsl(193, 60%, 50%)"
                    },
                    {
                        fileExtension: "txt",
                        absoluteMetricValue: 2,
                        relativeMetricValue: 0.5037783375314862,
                        color: "hsl(112, 60%, 50%)"
                    }
                ]
            }

            const result: CategorizedMetricDistribution = FileExtensionCalculator.getMetricDistribution(map, "rloc")

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
