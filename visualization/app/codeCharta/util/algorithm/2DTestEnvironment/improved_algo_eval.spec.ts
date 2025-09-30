import fs from "fs"
import { klona } from "klona"
import { STATE } from "../../dataMocks"
import { addUnaryMetric, generateCCFileAndMetricData, translateAttributesToTop } from "./algo-nodeGenerator"
import { LayoutAlgorithm } from "../../../codeCharta.model"
import { calculateEvaluationMetrics } from "./metricCalculation/metricCalculator"
import { OrderOption, SortingOption } from "../squarifyLayoutImproved/squarify"

describe("run improved eval", () => {
    let state

    beforeEach(() => {
        state = klona(STATE)
        state.dynamicSettings.focusedNodePath = []
        state.appSettings.experimentalFeaturesEnabled = false
    })

    it("should run eval for improved algorithms with combinations", () => {
        const allFileNames = fs.readdirSync(`${__dirname}/assets/selected_repos`).filter(fileName => fileName.endsWith(".cc.json"))
        let processedFiles = 0

        for (const fileName of allFileNames) {
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.log(`Now processing file: ${fileName}`)

            const pathToFile = `${__dirname}/assets/selected_repos/${fileName}`
            const outputFileName = pathToFile.replace(fileName, `improved-evaluation-${fileName.replace(".cc.json", ".json")}`)

            const rawFileContent = fs.readFileSync(pathToFile, "utf-8")
            const fileSize = fs.statSync(pathToFile).size

            const result = generateCCFileAndMetricData(state, rawFileContent, fileSize)
            const ccFile = result.ccFile
            const metricData = result.metricData

            const areaMetric = "rloc"
            state.dynamicSettings.areaMetric = areaMetric
            state.dynamicSettings.heightMetric = areaMetric

            translateAttributesToTop(ccFile.map, areaMetric)
            addUnaryMetric(ccFile.map)

            evalFile(outputFileName, state, areaMetric, ccFile, metricData)
            expect(fs.existsSync(outputFileName)).toBe(true)

            processedFiles++
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.log(`Progress: ${processedFiles} of ${allFileNames.length} files processed.`)
        }
    })

    function writeEvaluationToFile(outputFileName: string, algorithm: LayoutAlgorithm, settingsKey: string, evaluationMetrics: any) {
        const outputData = {
            algorithm,
            settingsAndValues: {
                settingsKey,
                Values: evaluationMetrics
            }
        }

        let parsedFileContent: any[] = []
        if (fs.existsSync(outputFileName)) {
            const fileContent = fs.readFileSync(outputFileName, "utf-8")
            parsedFileContent = JSON.parse(fileContent)
        }

        const algorithmIndex = parsedFileContent.findIndex((entry: any) => entry.algorithm === algorithm)

        if (algorithmIndex >= 0) {
            const existingSettingsIndex = parsedFileContent[algorithmIndex].settingsAndValues.findIndex(
                (entry: any) => entry.settingsKey === outputData.settingsAndValues.settingsKey
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

    function evalFile(outputFileName: string, state, areaMetric, ccFile, metricData) {
        //    "numberOfPasses:2_scale:true_simpleIncreaseValues:true__sorting:descending_orderOption:newOrder_incrementMargin:false_applySiblingMargin:true_collapseFolders:false_enableFloorLabels:false_amountOfTopLabels:0_labelLength:0": "Absolute Größenanpassung",

        const algorithm = LayoutAlgorithm.ImprovedSquarifying
        const marginValues = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 100, 150, 200]
        const numberOfPassesValues = [2]
        const scaleValues = [true]
        const simpleIncreaseValuesValues = [true]
        const sortingOptionValues = [SortingOption.DESCENDING]
        const orderOptionValues = [OrderOption.NEW_ORDER]
        const incrementMarginValues = [false]
        const applySiblingMarginValues = [false]
        const collapseFoldersValues = [true]
        const enableFloorLabelsValues = [true]
        const amountOfTopLabelsValues = [1, 2, 3, 4, 5]
        const labelLengthValues = [0, 1, 2, 3, 4, 5, 10, 20, 40, 60, 80, 100, 200, 300, 400, 500]

        //const settingsKeyTest = `margin:${marginValues[0]}_${numberOfPassesValues[0] !== undefined ? `x_numberOfPasses:${numberOfPassesValues[0]}` : ""}_${scaleValues[0] !== undefined ? `scale:${scaleValues[0]}` : ""}_${simpleIncreaseValuesValues[0] !== undefined ? `simpleIncreaseValues:${simpleIncreaseValuesValues[0]}` : ""}__${sortingOptionValues[0] !== undefined ? `sorting:${sortingOptionValues[0]}` : ""}_${orderOptionValues[0] !== undefined ? `orderOption:${orderOptionValues[0]}` : ""}_${incrementMarginValues[0] !== undefined ? `incrementMargin:${incrementMarginValues[0]}` : ""}_${applySiblingMarginValues[0] !== undefined ? `applySiblingMargin:half` : ""}_${collapseFoldersValues[0] !== undefined ? `collapseFolders:${collapseFoldersValues[0]}` : ""}_${enableFloorLabelsValues[0] !== undefined ? `enableFloorLabels:${enableFloorLabelsValues[0]}` : ""}_${amountOfTopLabelsValues[0] !== undefined ? `amountOfTopLabels:${amountOfTopLabelsValues[0]}` : ""}_${labelLengthValues[0] !== undefined ? `labelLength:${labelLengthValues[0]}` : ""}`
        const settingsKeyTest = `margin:${marginValues[0]}_${numberOfPassesValues[0] !== undefined ? `x_numberOfPasses:${numberOfPassesValues[0]}` : ""}_${scaleValues[0] !== undefined ? `scale:${scaleValues[0]}` : ""}_${simpleIncreaseValuesValues[0] !== undefined ? `simpleIncreaseValues:${simpleIncreaseValuesValues[0]}` : ""}__${sortingOptionValues[0] !== undefined ? `sorting:${sortingOptionValues[0]}` : ""}_${orderOptionValues[0] !== undefined ? `orderOption:${orderOptionValues[0]}` : ""}_${incrementMarginValues[0] !== undefined ? `incrementMargin:${incrementMarginValues[0]}` : ""}_${applySiblingMarginValues[0] !== undefined ? `applySiblingMargin:${applySiblingMarginValues[0]}` : ""}_${collapseFoldersValues[0] !== undefined ? `collapseFolders:${collapseFoldersValues[0]}` : ""}_${enableFloorLabelsValues[0] !== undefined ? `enableFloorLabels:${enableFloorLabelsValues[0]}` : ""}_${amountOfTopLabelsValues[0] !== undefined ? `amountOfTopLabels:${amountOfTopLabelsValues[0]}` : ""}_${labelLengthValues[0] !== undefined ? `labelLength:${labelLengthValues[0]}` : ""}`
        // biome-ignore lint/suspicious/noConsole: <explanation
        console.log(`${settingsKeyTest}`)

        const totalCombinations =
            marginValues.length *
            numberOfPassesValues.length *
            scaleValues.length *
            simpleIncreaseValuesValues.length *
            sortingOptionValues.length *
            orderOptionValues.length *
            incrementMarginValues.length
        let completedCombinations = 0

        for (const numberOfPasses of numberOfPassesValues) {
            for (const scale of scaleValues) {
                for (const simpleIncreaseValues of simpleIncreaseValuesValues) {
                    for (const sortingOption of sortingOptionValues) {
                        for (const orderOption of orderOptionValues) {
                            for (const incrementMargin of incrementMarginValues) {
                                for (const applySiblingMargin of applySiblingMarginValues) {
                                    for (const collapseFolders of collapseFoldersValues) {
                                        for (const enableFloorLabels of enableFloorLabelsValues) {
                                            for (const amountOfTopLabels of amountOfTopLabelsValues) {
                                                for (const labelLength of labelLengthValues) {
                                                    for (const marginValue of marginValues) {
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
                                                            orderOption,
                                                            incrementMargin,
                                                            applySiblingMargin,
                                                            collapseFolders,
                                                            "",
                                                            enableFloorLabels,
                                                            amountOfTopLabels,
                                                            labelLength,
                                                            1
                                                        )

                                                        //const settingsKey = `margin:${marginValue}_${numberOfPasses !== undefined ? `x_numberOfPasses:${numberOfPasses}` : ""}_${scale !== undefined ? `scale:${scale}` : ""}_${simpleIncreaseValues !== undefined ? `simpleIncreaseValues:${simpleIncreaseValues}` : ""}__${sortingOption !== undefined ? `sorting:${sortingOption}` : ""}_${orderOption !== undefined ? `orderOption:${orderOption}` : ""}_${incrementMargin !== undefined ? `incrementMargin:${incrementMargin}` : ""}_${applySiblingMargin !== undefined ? `applySiblingMargin:half` : ""}_${collapseFolders !== undefined ? `collapseFolders:${collapseFolders}` : ""}_${enableFloorLabels !== undefined ? `enableFloorLabels:${enableFloorLabels}` : ""}_${amountOfTopLabels !== undefined ? `amountOfTopLabels:${amountOfTopLabels}` : ""}_${labelLength !== undefined ? `labelLength:${labelLength}` : ""}`
                                                        const settingsKey = `margin:${marginValue}_${numberOfPasses !== undefined ? `x_numberOfPasses:${numberOfPasses}` : ""}_${scale !== undefined ? `scale:${scale}` : ""}_${simpleIncreaseValues !== undefined ? `simpleIncreaseValues:${simpleIncreaseValues}` : ""}__${sortingOption !== undefined ? `sorting:${sortingOption}` : ""}_${orderOption !== undefined ? `orderOption:${orderOption}` : ""}_${incrementMargin !== undefined ? `incrementMargin:${incrementMargin}` : ""}_${applySiblingMargin !== undefined ? `applySiblingMargin:${applySiblingMargin}` : ""}_${collapseFolders !== undefined ? `collapseFolders:${collapseFolders}` : ""}_${enableFloorLabels !== undefined ? `enableFloorLabels:${enableFloorLabels}` : ""}_${amountOfTopLabels !== undefined ? `amountOfTopLabels:${amountOfTopLabels}` : ""}_${labelLength !== undefined ? `labelLength:${labelLength}` : ""}`

                                                        writeEvaluationToFile(outputFileName, algorithm, settingsKey, evaluationMetrics)
                                                        completedCombinations++
                                                        // biome-ignore lint/suspicious/noConsole: <explanation>
                                                        /*console.log(
                                                            `Progress: ${completedCombinations}/${totalCombinations} (${Math.round((completedCombinations / totalCombinations) * 100)}%)`
                                                        )*/
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
    }
})
