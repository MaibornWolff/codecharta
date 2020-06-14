import { CodeMapNode, CCFile, NodeType } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"
import { FileNameHelper } from "./fileNameHelper"
import { getUpdatedPath } from "./nodePathHelper"
import { getAPIVersion } from "./version"

export class AggregationGenerator {
	private static projectNameArray: string[] = []
	private static fileNameArray: string[] = []

	public static getAggregationFile(inputFiles: CCFile[]): CCFile {
		if (inputFiles.length == 1) {
			return inputFiles[0]
		}

		this.resetVariables()

		for (const inputFile of inputFiles) {
			this.projectNameArray.push(inputFile.fileMeta.projectName.replace(" ", "_"))
			this.fileNameArray.push(FileNameHelper.withoutCCJsonExtension(inputFile.fileMeta.fileName).replace(" ", "_"))
		}
		return this.getNewAggregatedMap(inputFiles)
	}

	private static getNewAggregatedMap(inputFiles: CCFile[]): CCFile {
		const outputFile: CCFile = {
			fileMeta: {
				projectName: "project_aggregation_of_" + this.projectNameArray.join("_and_"),
				fileName: "file_aggregation_of_" + this.fileNameArray.join("_and_"),
				apiVersion: getAPIVersion()
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
		outputFile.map.children.forEach(child => {
			const attributes = child.attributes
			for (const key in attributes) {
				if (!(key in outputFile.map.attributes)) {
					outputFile.map.attributes[key] = 0
				}
				outputFile.map.attributes[key] += attributes[key]
			}
		})
	}

	private static extractNodeFromMap(inputMap: CCFile): CodeMapNode {
		const outputNode: CodeMapNode = {
			name: inputMap.fileMeta.fileName,
			children: inputMap.map.children
		} as CodeMapNode

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
		for (let i = 0; i < children.length; i++) {
			if (children[i].path) {
				children[i].path = getUpdatedPath(fileName, children[i].path)
			}

			if (children[i].children) {
				this.updatePathOfAllChildren(fileName, children[i].children)
			}
		}
	}

	private static resetVariables() {
		this.projectNameArray = []
		this.fileNameArray = []
	}
}
