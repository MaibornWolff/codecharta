import fs from "fs"
import { klona } from "klona"
import { STATE } from "../../dataMocks"
import { addUnaryMetric, generateCCFileAndMetricData, translateAttributesToTop } from "./algo-nodeGenerator"
import { LayoutAlgorithm } from "../../../codeCharta.model"
import { calculateEvaluationMetrics } from "./metricCalculation/metricCalculator"

describe("run basic squarify eval", () => {
    let state

    beforeEach(() => {
        state = klona(STATE)
        state.dynamicSettings.focusedNodePath = []
        state.appSettings.experimentalFeaturesEnabled = false
    })

    it("should run eval for basic squarify algorithm with different aimed ratios", () => {
        const allFileNames = fs.readdirSync(`${__dirname}/assets/selected_repos`).filter(fileName => fileName.endsWith(".cc.json"))
        let processedFiles = 0

        for (const fileName of allFileNames) {
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.log(`Now processing file: ${fileName}`)

            const pathToFile = `${__dirname}/assets/selected_repos/${fileName}`
            const outputFileName = pathToFile.replace(fileName, `basic-evaluation-${fileName.replace(".cc.json", ".json")}`)

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
        // Different aimed ratios to test: 0.1, 0.5, 0.9, 1, 1.1, 1.5, 2, phi (golden ratio), 5, 10
        const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
        const aimedRatioValues = [0.1, 0.5, 0.9, 0.99, 1, 1.025, 1.05, 1.1, 1.15, 1.2, 1.3, 1.5, phi, 2, 5, 10]

        const algorithm = LayoutAlgorithm.Squarifying
        let completedCombinations = 0
        const totalCombinations = aimedRatioValues.length

        for (const aimedRatio of aimedRatioValues) {
            const evaluationMetrics = calculateEvaluationMetrics(
                state,
                0, // margin - basic squarify doesn't use margin
                algorithm,
                ccFile.map,
                areaMetric,
                metricData,
                undefined, // numberOfPasses - not used in basic squarify
                undefined, // scale - not used in basic squarify
                undefined, // simpleIncreaseValues - not used in basic squarify
                undefined, // sortingOption - not used in basic squarify
                undefined, // orderOption - not used in basic squarify
                undefined, // incrementMargin - not used in basic squarify
                undefined, // applySiblingMargin - not used in basic squarify
                undefined, // collapseFolders - not used in basic squarify
                "", // focusedNodePath
                undefined, // enableFloorLabels - not used in basic squarify
                undefined, // amountOfTopLabels - not used in basic squarify
                undefined, // labelLength - not used in basic squarify
                aimedRatio // aimedRatio - specific to basic squarify
            )

            const settingsKey = `aimedRatio:${aimedRatio}`

            writeEvaluationToFile(outputFileName, algorithm, settingsKey, evaluationMetrics)
            completedCombinations++
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.log(
                `Progress: ${completedCombinations}/${totalCombinations} (${Math.round((completedCombinations / totalCombinations) * 100)}%)`
            )
        }
    }
})
