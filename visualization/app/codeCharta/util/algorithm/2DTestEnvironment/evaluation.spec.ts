import fs from "fs"
import { klona } from "klona"
import { STATE } from "../../dataMocks"
import { addUnaryMetric, generateCCFileAndMetricData, translateAttributesToTop } from "./algo-nodeGenerator"
import { LayoutAlgorithm } from "../../../codeCharta.model"
import { calculateDiffMetric, calculateEvaluationMetrics } from "./metricCalculation/metricCalculator"
import { OrderOption, SortingOption } from "../squarifyLayoutImproved/squarify"

describe("run eval", () => {
    let state: typeof STATE
    let fileName: string
    let pathToFile: string
    let areaMetric: string
    let rawFileContent: string
    let fileSize: number
    let ccFile: any
    let metricData: any
    let fileFilter: string
    let applicableAlgorithms: LayoutAlgorithm[]

    beforeEach(() => {
        fileName = "react.cc.json"
        pathToFile = `${__dirname}/assets/repos/${fileName}`
        fileFilter = ""
        console.error("PLEASE SET THE FILE FILTER")
        rawFileContent = fs.readFileSync(pathToFile, "utf-8")
        fileSize = fs.statSync(pathToFile).size
        state = klona(STATE)
        const result = generateCCFileAndMetricData(state, rawFileContent, fileSize)
        ccFile = result.ccFile
        metricData = result.metricData

        const availableAreaMetrics = metricData.map(metric => metric.name)
        if (availableAreaMetrics.includes("rloc")) {
            areaMetric = "rloc"
        } else if (availableAreaMetrics.includes("lines_of_code")) {
            areaMetric = "lines_of_code"
        } else {
            areaMetric = availableAreaMetrics[0]
        }

        applicableAlgorithms = [
            LayoutAlgorithm.myAlgo,
            LayoutAlgorithm.CodeCity,
            LayoutAlgorithm.NestedTreemap,
            LayoutAlgorithm.ImprovedSquarifying
        ]

        state.dynamicSettings.focusedNodePath = []
        state.appSettings.enableFloorLabels = false
        state.appSettings.experimentalFeaturesEnabled = false
        state.dynamicSettings.margin = 15
        state.dynamicSettings.areaMetric = areaMetric
        state.dynamicSettings.heightMetric = areaMetric

        translateAttributesToTop(ccFile.map, areaMetric)
        addUnaryMetric(ccFile.map)
    })

    function writeEvaluationToFile(outputFileName: string, algorithm: LayoutAlgorithm, outputData: any) {
        let parsedFileContent: any[] = []
        if (fs.existsSync(outputFileName)) {
            const fileContent = fs.readFileSync(outputFileName, "utf-8")
            parsedFileContent = JSON.parse(fileContent)
        }

        const algorithmIndex = parsedFileContent.findIndex((entry: any) => entry.algorithm === algorithm)

        if (algorithmIndex >= 0) {
            const existingSettingsIndex = parsedFileContent[algorithmIndex].settingsAndValues.findIndex(
                (entry: any) => entry.settingsKey === outputData.settingsKey
            )
            if (existingSettingsIndex >= 0) {
                parsedFileContent[algorithmIndex].settingsAndValues[existingSettingsIndex] = outputData.settingsAndValues
            } else {
                parsedFileContent[algorithmIndex].settingsAndValues.push(outputData.settingsAndValues)
            }
        } else {
            parsedFileContent.push({
                algorithm,
                settingsAndValues: [outputData.settingsAndValues]
            })
        }
        fs.writeFileSync(outputFileName, JSON.stringify(parsedFileContent, null, 4))
    }

    function writeDiffToFile(outputFileName: string, algorithm: LayoutAlgorithm, outputData: any) {
        let parsedFileContent: any[] = []
        if (fs.existsSync(outputFileName)) {
            const fileContent = fs.readFileSync(outputFileName, "utf-8")
            parsedFileContent = JSON.parse(fileContent)
        }

        const algorithmIndex = parsedFileContent.findIndex((entry: any) => entry.algorithm === algorithm)

        if (algorithmIndex >= 0) {
            const existingSettingsIndex = parsedFileContent[algorithmIndex].settingsAndValues.findIndex(
                (entry: any) => entry.settingsKey === outputData.settingsKey
            )
            if (existingSettingsIndex >= 0) {
                parsedFileContent[algorithmIndex].settingsAndValues[existingSettingsIndex] = outputData.settingsAndValues
            } else {
                parsedFileContent[algorithmIndex].settingsAndValues.push(outputData.settingsAndValues)
            }
        } else {
            parsedFileContent.push({
                algorithm,
                settingsAndValues: [outputData.settingsAndValues]
            })
        }
        fs.writeFileSync(outputFileName, JSON.stringify(parsedFileContent, null, 4))
    }

    it("should run eval for all algorithms", () => {
        const marginValues = [0, 1, 2, 5, 10, 20, 40, 80, 100]
        const totalCombinations = applicableAlgorithms.length * marginValues.length
        let completedCombinations = 0
        const outputFileName = pathToFile.replace(fileName, `evaluation-${fileName.replace(".cc.json", ".json")}`)

        for (const marginValue of marginValues) {
            for (const algorithm of applicableAlgorithms) {
                const evaluationMetrics = calculateEvaluationMetrics(
                    state,
                    marginValue,
                    algorithm,
                    ccFile.map,
                    areaMetric,
                    metricData,
                    2, // numberOfPasses
                    true,
                    false,
                    SortingOption.DESCENDING,
                    OrderOption.KEEP_PLACE, // Use OrderOption enum instead of boolean
                    true,
                    true,
                    false,
                    "",
                    false,
                    0,
                    0,
                    1
                )

                const outputData = {
                    algorithm,
                    settingsAndValues: {
                        settingsKey: `margin_${marginValue}`,
                        Values: evaluationMetrics
                    }
                }

                writeEvaluationToFile(outputFileName, algorithm, outputData)
                completedCombinations++
                // biome-ignore lint/suspicious/noConsole: <explanation>
                console.log(
                    `Progress: ${completedCombinations}/${totalCombinations} (${Math.round((completedCombinations / totalCombinations) * 100)}%)`
                )
            }
        }
    })

    it("should run eval for improved algorithms with combinations", () => {
        const marginValues = [0, 1, 5, 10, 50, 100]
        const numberOfPassesValues = [2, 3, 4, 5]
        const scaleValues = [true]
        const simpleIncreaseValuesValues = [false]
        const sortingOptionValues = [SortingOption.DESCENDING]
        const orderOptionValues = [OrderOption.NEW_ORDER, OrderOption.KEEP_ORDER, OrderOption.KEEP_PLACE] // Use OrderOption enum instead of boolean
        const incrementMarginValues = [true, false]
        const applySiblingMarginValues = [true, false]
        const collapseFoldersValues = [true, false]
        const enableFloorLabelsValues = [true, false]
        const amountOfTopLabelsValues = [1, 2, 3, 4, 5]
        const labelLengthValues = [0, 10, 20, 30, 40, 50]

        const totalCombinations =
            marginValues.length *
            numberOfPassesValues.length *
            scaleValues.length *
            simpleIncreaseValuesValues.length *
            sortingOptionValues.length *
            orderOptionValues.length * // Updated to use orderOptionValues
            incrementMarginValues.length
        let completedCombinations = 0
        const algorithm = LayoutAlgorithm.ImprovedSquarifying
        const outputFileName = pathToFile.replace(fileName, `improved-evaluation-${fileName.replace(".cc.json", ".json")}`)

        for (const marginValue of marginValues) {
            for (const numberOfPasses of numberOfPassesValues) {
                for (const scale of scaleValues) {
                    for (const simpleIncreaseValues of simpleIncreaseValuesValues) {
                        for (const sortingOption of sortingOptionValues) {
                            for (const orderOption of orderOptionValues) {
                                // Use orderOption instead of keepOrder
                                for (const incrementMargin of incrementMarginValues) {
                                    for (const applySiblingMargin of applySiblingMarginValues) {
                                        for (const collapseFolders of collapseFoldersValues) {
                                            for (const enableFloorLabels of enableFloorLabelsValues) {
                                                for (const amountOfTopLabels of amountOfTopLabelsValues) {
                                                    for (const labelLength of labelLengthValues) {
                                                        const evaluationMetrics = calculateEvaluationMetrics(
                                                            state,
                                                            marginValue,
                                                            algorithm,
                                                            ccFile.map,
                                                            areaMetric,
                                                            metricData,
                                                            numberOfPasses,
                                                            scale,
                                                            simpleIncreaseValues,
                                                            sortingOption,
                                                            orderOption, // Use orderOption enum value
                                                            incrementMargin,
                                                            applySiblingMargin,
                                                            collapseFolders,
                                                            fileFilter,
                                                            enableFloorLabels,
                                                            amountOfTopLabels,
                                                            labelLength,
                                                            1
                                                        )

                                                        const settingsKey = `margin:${marginValue}_${numberOfPasses !== undefined ? `numberOfPasses:${numberOfPasses}` : ""}_${scale !== undefined ? `scale:${scale}` : ""}_${simpleIncreaseValues !== undefined ? `simpleIncreaseValues:${simpleIncreaseValues}` : ""}__${sortingOption !== undefined ? `sorting:${sortingOption}` : ""}_${orderOption !== undefined ? `orderOption:${orderOption}` : ""}_${incrementMargin !== undefined ? `incrementMargin:${incrementMargin}` : ""}_${applySiblingMargin !== undefined ? `applySiblingMargin:${applySiblingMargin}` : ""}_${collapseFolders !== undefined ? `collapseFolders:${collapseFolders}` : ""}_${enableFloorLabels !== undefined ? `enableFloorLabels:${enableFloorLabels}` : ""}_${amountOfTopLabels !== undefined ? `amountOfTopLabels:${amountOfTopLabels}` : ""}_${labelLength !== undefined ? `labelLength:${labelLength}` : ""}`

                                                        const outputData = {
                                                            algorithm,
                                                            settingsAndValues: {
                                                                settingsKey: settingsKey,
                                                                Values: evaluationMetrics
                                                            }
                                                        }

                                                        writeEvaluationToFile(outputFileName, algorithm, outputData)
                                                        completedCombinations++
                                                        // biome-ignore lint/suspicious/noConsole: <explanation>
                                                        console.log(
                                                            `Progress: ${completedCombinations}/${totalCombinations} (${Math.round((completedCombinations / totalCombinations) * 100)}%)`
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Verify that the output file was created
        expect(fs.existsSync(outputFileName)).toBe(true)
    })

    it("should calculate and write diffs between two date files", () => {
        const file1Path = `${__dirname}/assets/dates/codecharta_raw_2025-05-26.cc.json`
        const file2Path = `${__dirname}/assets/dates/codecharta_raw_2024-12-23.cc.json`
        const outputDiffFileName = `${__dirname}/assets/dates/diff_2024-12-23_to_2025-05-26.json`

        // Read and parse both files
        const rawFileContent1 = fs.readFileSync(file1Path, "utf-8")
        const fileSize1 = fs.statSync(file1Path).size
        const state1 = klona(STATE)
        const result1 = generateCCFileAndMetricData(state1, rawFileContent1, fileSize1)
        const ccFile1 = result1.ccFile
        const metricData1 = result1.metricData

        const rawFileContent2 = fs.readFileSync(file2Path, "utf-8")
        const fileSize2 = fs.statSync(file2Path).size
        const state2 = klona(STATE)
        const result2 = generateCCFileAndMetricData(state2, rawFileContent2, fileSize2)
        const ccFile2 = result2.ccFile
        const metricData2 = result2.metricData

        // Find a suitable area metric that exists in both files
        const availableAreaMetrics1 = metricData1.map(metric => metric.name)
        const availableAreaMetrics2 = metricData2.map(metric => metric.name)
        const commonAreaMetrics = availableAreaMetrics1.filter(metric => availableAreaMetrics2.includes(metric))

        let areaMetric = ""
        if (commonAreaMetrics.includes("rloc")) {
            areaMetric = "rloc"
        } else if (commonAreaMetrics.includes("lines_of_code")) {
            areaMetric = "lines_of_code"
        } else if (commonAreaMetrics.length > 0) {
            areaMetric = commonAreaMetrics[0]
        } else {
            throw new Error("No common area metrics found between the two files")
        }

        // Configure state for evaluation
        const state = klona(STATE)
        state.dynamicSettings.focusedNodePath = []
        state.appSettings.enableFloorLabels = false
        state.appSettings.experimentalFeaturesEnabled = false
        state.dynamicSettings.margin = 15
        state.dynamicSettings.areaMetric = areaMetric
        state.dynamicSettings.heightMetric = areaMetric

        // Prepare files for evaluation
        translateAttributesToTop(ccFile1.map, areaMetric)
        addUnaryMetric(ccFile1.map)
        translateAttributesToTop(ccFile2.map, areaMetric)
        addUnaryMetric(ccFile2.map)

        // Set up algorithms to test
        const applicableAlgorithms = [
            LayoutAlgorithm.myAlgo,
            LayoutAlgorithm.CodeCity,
            LayoutAlgorithm.NestedTreemap,
            LayoutAlgorithm.ImprovedSquarifying
        ]

        const marginValues = [0, 5, 15, 30]
        const totalCombinations = applicableAlgorithms.length * marginValues.length
        let completedCombinations = 0

        // Calculate diffs for each algorithm and margin combination
        for (const marginValue of marginValues) {
            for (const algorithm of applicableAlgorithms) {
                const diffMetrics = calculateDiffMetric(
                    state,
                    marginValue,
                    algorithm,
                    ccFile1.map,
                    ccFile2.map,
                    metricData1,
                    1, // numberOfPasses
                    false,
                    false,
                    SortingOption.NONE,
                    OrderOption.NEW_ORDER, // Use OrderOption enum instead of boolean
                    false,
                    true,
                    false,
                    "",
                    false,
                    0,
                    0,
                    1
                )

                const outputData = {
                    algorithm,
                    settingsAndValues: {
                        setMarginValue: marginValue,
                        settingsKey: `margin_${marginValue}`,
                        Values: diffMetrics
                    }
                }

                writeDiffToFile(outputDiffFileName, algorithm, outputData)

                completedCombinations++
                // biome-ignore lint/suspicious/noConsole: <explanation>
                console.log(
                    `Diff Progress: ${completedCombinations}/${totalCombinations} (${Math.round((completedCombinations / totalCombinations) * 100)}%)`
                )
            }
        }

        // Verify that the output file was created
        expect(fs.existsSync(outputDiffFileName)).toBe(true)
    })
})
