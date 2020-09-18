import { CodeMapNode, CCFile, NodeType } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"
import { FileNameHelper } from "./fileNameHelper"
import { getUpdatedPath } from "./nodePathHelper"
import packageJson from "../../../package.json"

export class AggregationGenerator {
	private static projectNameArray: string[] = []
	private static fileNameArray: string[] = []

	static getAggregationFile(inputFiles: CCFile[]) {
		if (inputFiles.length === 1) {
			return inputFiles[0]
		}

		this.resetVariables()

		for (const inputFile of inputFiles) {
			this.projectNameArray.push(inputFile.fileMeta.projectName.replace(" ", "_"))
			this.fileNameArray.push(FileNameHelper.withoutCCJsonExtension(inputFile.fileMeta.fileName).replace(" ", "_"))
		}
		return this.getNewAggregatedMap(inputFiles)
	}

	private static getNewAggregatedMap(inputFiles: CCFile[]) {
		const outputFile: CCFile = {
			fileMeta: {
				projectName: `project_aggregation_of_${this.projectNameArray.join("_and_")}`,
				fileName: `file_aggregation_of_${this.fileNameArray.join("_and_")}`,
				apiVersion: packageJson.codecharta.apiVersion
			},
			map: {
				name: CodeChartaService.ROOT_NAME,
				type: NodeType.FOLDER,
				children: [],
				attributes: {},
				path: CodeChartaService.ROOT_PATH
			},
			settings: {
				fileSettings: {
					edges: [],
					blacklist: [],
					attributeTypes: { nodes: {}, edges: {} },
					markedPackages: []
				}
			}
		}

		for (const inputMap of inputFiles) {
			outputFile.map.children.push(this.extractNodeFromMap(inputMap))
		}
		this.aggregateRootAttributes(outputFile)

		return outputFile
	}

	private static aggregateRootAttributes(outputFile: CCFile) {
		for (const child of outputFile.map.children) {
			const { attributes } = child
			// TODO: Remove `in` usage (in general throughout the code)
			for (const key in attributes) {
				if (!(key in outputFile.map.attributes)) {
					outputFile.map.attributes[key] = 0
				}
				outputFile.map.attributes[key] += attributes[key]
			}
		}
	}

	private static extractNodeFromMap(inputMap: CCFile) {
		const outputNode: CodeMapNode = {
			name: inputMap.fileMeta.fileName,
			children: inputMap.map.children,
			type: inputMap.map.type
		}

		if (inputMap.map.path) {
			outputNode.path = getUpdatedPath(inputMap.fileMeta.fileName, inputMap.map.path)
		}

		for (const key in inputMap.map) {
			if (!["name", "path", "children"].includes(key)) {
				outputNode[key] = inputMap.map[key]
			}
		}
		this.updatePathOfAllChildren(inputMap.fileMeta.fileName, outputNode.children)
		return outputNode
	}

	private static updatePathOfAllChildren(fileName: string, children: CodeMapNode[]) {
		for (const child of children) {
			if (child.path) {
				child.path = getUpdatedPath(fileName, child.path)
			}

			if (child.children) {
				this.updatePathOfAllChildren(fileName, child.children)
			}
		}
	}

	private static resetVariables() {
		this.projectNameArray = []
		this.fileNameArray = []
	}
}
