import { Component, ViewEncapsulation } from "@angular/core"
import { FileDownloader } from "../../util/fileDownloader"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { FileNameHelper } from "../../util/fileNameHelper"
import { isDeltaState } from "../../model/files/files.helper"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { filesSelector } from "../../state/store/files/files.selector"
import { BufferAttribute, Mesh } from "three"
import { State } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

@Component({
	selector: "cc-export-threed-map-button",
	templateUrl: "./export3DMapButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapButtonComponent {
	private stlExporter = new STLExporter()
	constructor(private state: State<CcState>, private threeSceneService: ThreeSceneService) {}

	downloadStlFile() {
		const files = filesSelector(this.state.getValue())
		const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
		const threeMesh: Mesh = this.threeSceneService.getMapMesh().getThreeMesh()
		const exportedBinaryFile = this.stlExporter.parse(threeMesh, { binary: true }) as unknown as string
		const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.stl`
		FileDownloader.downloadData(exportedBinaryFile, downloadFileName)
	}

	private hexToNamedColor(hex: string): string {
		const colors = {
			"#820e0e": "red",
			"#69ae40": "green",
			"#ddcc00": "yellow"
		}
		return colors[hex.toLowerCase()] || hex
	}

	async downloadOpenScadFile(): Promise<void> {
		const files = filesSelector(this.state.getValue())
		const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName

		const sideLength = 206
		const minLayerHeight = 0.2

		const nodes = this.threeSceneService.getMapMesh().getNodes()
		const longestSide = Math.max(...nodes.flatMap(node => [node.width, node.length]))
		const xyScalingFactor = sideLength / longestSide

		const smallestHeight = Math.min(...nodes.map(node => node.height || minLayerHeight))
		const baseZScalingFactor = minLayerHeight / smallestHeight

		// create an openscad code line for each node that renders the node as a cube with the correct color and translated to the correct position
		const openscadCode = nodes
			.map(node => {
				const color = node.isLeaf ? this.hexToNamedColor(node.color) : "gray"
				const position = { x: node.x0 * xyScalingFactor, y: node.y0 * xyScalingFactor, z: node.z0 * baseZScalingFactor }
				const size = { x: node.width * xyScalingFactor, y: node.length * xyScalingFactor, z: node.height * baseZScalingFactor }

				const renderHeight = node.isLeaf ? `max(${minLayerHeight}, ${size.z} * zScale)` : `${size.z}`
				return `translate([${position.x}, ${position.y}, ${position.z}]) mcolor("${color}") cube([${size.x}, ${size.y}, ${renderHeight}]);`
			})
			.join("\n")

		const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.scad`
		FileDownloader.downloadData(openscadCode, downloadFileName)
	}

	async downloadMultipleStlFiles(): Promise<void> {
		const files = filesSelector(this.state.getValue())
		const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName
		const mapMesh = this.threeSceneService.getMapMesh()
		const threeMesh: Mesh = mapMesh.getThreeMesh()

		// console.log("Starting export...")

		const colorNodeGroups: { color: string; vertexIndexes: number[]; mesh?: Mesh }[] = []
		// iterate over vertices and group them by color
		for (let index = 0; index < threeMesh.geometry.attributes.color.count; index++) {
			const colorsArray = [
				threeMesh.geometry.attributes.color.getX(index),
				threeMesh.geometry.attributes.color.getY(index),
				threeMesh.geometry.attributes.color.getZ(index)
			]
			// special case for grey tones, unify into one color
			if (colorsArray[0] === colorsArray[1] && colorsArray[1] === colorsArray[2]) {
				colorsArray[0] = 0.5
				colorsArray[1] = 0.5
				colorsArray[2] = 0.5
			}

			// convert color array to hex color string
			const color = colorsArray
				.map(c =>
					Math.round(c * 255)
						.toString(16)
						.padStart(2, "0")
				)
				.join("")

			const colorNodeGroup = colorNodeGroups.find(cng => cng.color === color)
			if (colorNodeGroup) {
				colorNodeGroup.vertexIndexes.push(index)
			} else {
				colorNodeGroups.push({ color, vertexIndexes: [index] })
			}
		}

		// console.log(`Exporting ${colorNodeGroups.length} color groups...`, colorNodeGroups);

		// join each color group into a single mesh
		for (const colorNodeGroup of colorNodeGroups) {
			const mesh = new Mesh()

			// clone threeMesh geometry but only display vertices from the group - I'm not sure how exactly this works but Copilot wrote it, and it does work :D
			const geometry = threeMesh.geometry.clone()
			const vertexIndexes = colorNodeGroup.vertexIndexes
			const vertexCount = vertexIndexes.length
			const vertexPositions = new Float32Array(vertexCount * 3)
			const vertexNormals = new Float32Array(vertexCount * 3)
			const vertexColors = new Float32Array(vertexCount * 3)
			for (let index = 0; index < vertexCount; index++) {
				const vertexIndex = vertexIndexes[index]
				vertexPositions[index * 3] = geometry.attributes.position.getX(vertexIndex)
				vertexPositions[index * 3 + 1] = geometry.attributes.position.getY(vertexIndex)
				vertexPositions[index * 3 + 2] = geometry.attributes.position.getZ(vertexIndex)
				vertexNormals[index * 3] = geometry.attributes.normal.getX(vertexIndex)
				vertexNormals[index * 3 + 1] = geometry.attributes.normal.getY(vertexIndex)
				vertexNormals[index * 3 + 2] = geometry.attributes.normal.getZ(vertexIndex)
				vertexColors[index * 3] = geometry.attributes.color.getX(vertexIndex)
				vertexColors[index * 3 + 1] = geometry.attributes.color.getY(vertexIndex)
				vertexColors[index * 3 + 2] = geometry.attributes.color.getZ(vertexIndex)
			}
			geometry.setAttribute("position", new BufferAttribute(vertexPositions, 3))
			geometry.setAttribute("normal", new BufferAttribute(vertexNormals, 3))
			geometry.setAttribute("color", new BufferAttribute(vertexColors, 3))
			mesh.geometry = geometry

			colorNodeGroup.mesh = mesh
		}

		// export each mesh as a separate file
		for (const { color, mesh } of colorNodeGroups) {
			const exportedBinaryFile = this.stlExporter.parse(mesh, { binary: true })
			const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}_${color}.stl`
			FileDownloader.downloadData(exportedBinaryFile, downloadFileName)
		}

		// console.log("Export done...")
	}
}
