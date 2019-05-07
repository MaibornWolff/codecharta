import {CodeMapNode, CCFile} from "../codeCharta.model"
import {CodeChartaService} from "../codeCharta.service";

export class AggregationGenerator {

	private static projectNameArray: string[] = []
	private static fileNameArray: string[] = []

	public static getAggregationFile(inputFiles: CCFile[]): CCFile {
		if (inputFiles.length == 1) {
			return inputFiles[0]
		}

		this.resetVariables()

		for (let inputFile of inputFiles) {
			this.projectNameArray.push(inputFile.fileMeta.projectName)
			this.fileNameArray.push(inputFile.fileMeta.fileName)
		}
		return this.getNewAggregatedMap(inputFiles)
	}

	private static getNewAggregatedMap(inputFiles: CCFile[]): CCFile {
		let outputFile: CCFile = {
			fileMeta: {
				projectName: "Aggregation of following projects: " + this.projectNameArray.join(", "),
				fileName: "Aggregation of following files: " + this.fileNameArray.join(", "),
				apiVersion: require("../../../package.json").codecharta.apiVersion
			},
			map: {
				name: CodeChartaService.ROOT_NAME,
				type: "Folder",
				children: [] as CodeMapNode[],
				attributes: {},
				origin: "Aggregation of following files: " + this.fileNameArray.join(", "),
				path: CodeChartaService.ROOT_PATH,
				visible: true
			},
			settings: {
				fileSettings: {
					edges: [],
					blacklist: [],
					attributeTypes: {},
					markedPackages: []
				}
			}
		}

		for (let inputMap of inputFiles) {
			outputFile.map.children.push(this.extractNodeFromMap(inputMap))
		}
		this.aggregateRootAttributes(outputFile)
		return outputFile
	}

	private static aggregateRootAttributes(outputFile: CCFile) {
		outputFile.map.children.forEach(child => {
			let attributes = child.attributes
			for (let key in attributes) {
				if (!(key in outputFile.map.attributes)) {
					outputFile.map.attributes[key] = 0
				}
				outputFile.map.attributes[key] += attributes[key]
			}
		})
	}

	private static extractNodeFromMap(inputMap: CCFile): CodeMapNode {
		let outputNode: CodeMapNode = {
			name: inputMap.fileMeta.fileName,
			children: inputMap.map.children
		} as CodeMapNode

		if (inputMap.map.path) {
			outputNode.path = this.getUpdatedPath(inputMap.fileMeta.fileName, inputMap.map.path)
		}

		for (let key in inputMap.map) {
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
				children[i].path = this.getUpdatedPath(fileName, children[i].path)
			}

			if (children[i].children) {
				this.updatePathOfAllChildren(fileName, children[i].children)
			}
		}
	}

	private static getUpdatedPath(fileName: string, path: string): string {
		const folderArray = path.split("/")
		folderArray.splice(2, 0, fileName)
		return folderArray.join("/")
	}

	private static resetVariables() {
		this.projectNameArray = []
		this.fileNameArray = []
	}
}
