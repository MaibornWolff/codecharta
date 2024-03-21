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
import { primitives } from "@jscad/modeling"
import { serialize } from "@jscad/3mf-serializer"
import { deserialize } from "@jscad/svg-deserializer"
import { colorize, colorNameToRgb } from "@jscad/modeling/src/colors"
import { strToU8, zipSync } from "fflate"
import { circle, roundedRectangle } from "@jscad/modeling/src/primitives"
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions"
import { Geom3 } from "@jscad/modeling/src/geometries/geom3"
import { Vec3 } from "@jscad/modeling/src/maths/vec3"
import { center, rotateZ, scale, translate } from "@jscad/modeling/src/operations/transforms"
import { HttpClient } from "@angular/common/http"
import { firstValueFrom, timeout } from "rxjs"
import { intersect, union } from "@jscad/modeling/src/operations/booleans"
import { vectorText } from "@jscad/modeling/src/text"
import { hullChain } from "@jscad/modeling/src/operations/hulls"
import { degToRad } from "@jscad/modeling/src/utils"

@Component({
	selector: "cc-export-threed-map-button",
	templateUrl: "./export3DMapButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapButtonComponent {
	private stlExporter = new STLExporter()
	constructor(private httpClient: HttpClient, private state: State<CcState>, private threeSceneService: ThreeSceneService) {}

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

	async download3MFFile(): Promise<void> {
		const printerSideLengths = {
			prusaMk3s: { x: 220, y: 200 },
			bambuA1: { x: 0, y: 0 }
		}

		const contenttype = `<?xml version="1.0" encoding="UTF-8"?>
			<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
				<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
				<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
				<Default Extension="png" ContentType="image/png"/>
					</Types>`
		const rels = `<?xml version="1.0" encoding="UTF-8" ?>
			<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
			  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel">
			  </Relationship>
			</Relationships>`

		const files = filesSelector(this.state.getValue())
		const fileName = accumulatedDataSelector(this.state.getValue()).unifiedFileMeta?.fileName

		const printer = "prusaMk3s"
		const xMaxSideLength = printerSideLengths[printer].x
		const yMaxSideLength = printerSideLengths[printer].y
		const mapSideOffset = 2

		const sideLength = Math.min(xMaxSideLength, yMaxSideLength) - mapSideOffset * 2
		const nodes = this.threeSceneService.getMapMesh().getNodes()
		const longestSide = Math.max(...nodes.flatMap(node => [node.width, node.length]))
		const xyScalingFactor = sideLength / longestSide

		const minLayerHeight = 0.2
		const smallestHeight = Math.min(...nodes.map(node => node.height || minLayerHeight))
		const zScalingFactor = minLayerHeight / smallestHeight

		const baseplateHeight = 2 * zScalingFactor

		const mwLogo: Geom3 = await this.logo(
			"mw_logo_min.svg",
			[mapSideOffset + 20, Math.min(xMaxSideLength, yMaxSideLength) + mapSideOffset * 3, baseplateHeight],
			[0.6, 0.6, 0.6]
		)
		const map = this.maps(xyScalingFactor, zScalingFactor, baseplateHeight)
		const baseplate = this.baseplate(
			Math.min(xMaxSideLength, yMaxSideLength),
			Math.max(xMaxSideLength, yMaxSideLength),
			baseplateHeight,
			mapSideOffset
		)
		const testText = this.createText("MW CodeCharta POC", [
			Math.min(xMaxSideLength, yMaxSideLength) / 2,
			Math.min(xMaxSideLength, yMaxSideLength) + mapSideOffset * 3,
			baseplateHeight
		])

		/*
		const codeChartaLogo : Promise<Geom3> = this.logo("codecharta_logo.svg", [mapSideOffset, Math.min(xMaxSideLength, yMaxSideLength) + mapSideOffset*3, baseplateHeight], [0.6, 0.6, 0.6], 180)
		geometries.push(await codeChartaLogo)

		const customerLogo : Promise<Geom3> = this.logo("mw_logo.svg", [Math.min(xMaxSideLength, yMaxSideLength) - mapSideOffset, Math.min(xMaxSideLength, yMaxSideLength) + mapSideOffset*3, baseplateHeight], [0.6, 0.6, 0.6], 180)
		geometries.push(await customerLogo)*/

		let geometries = [mwLogo, ...map, baseplate, testText]
		if (xMaxSideLength > yMaxSideLength) {
			geometries = geometries.map(geom => rotateZ(Math.PI / 2, geom))
		}
		// serialize the geometries into a 3MF file
		const { model, modelConfig } = await this.serializeGeometries(geometries)

		//const model = serialize({ compress: true }, geometries)[0]

		const data = {
			"3D": {
				"3dmodel.model": strToU8(model)
			},
			_rels: {
				".rels": strToU8(rels)
			},
			Metadata: {
				"Slic3r_PE_model.config": strToU8(modelConfig)
			},
			"[Content_Types].xml": strToU8(contenttype)
		}
		const options = {
			comment: "created by CodeCharta"
		}

		// @ts-ignore
		const compressed3mf: string = zipSync(data, options).buffer

		const downloadFileName = `${FileNameHelper.getNewFileName(fileName, isDeltaState(files))}.3mf`
		FileDownloader.downloadData(compressed3mf, downloadFileName)
	}

	serializeGeometries = async (geometries: Geom3[]): Promise<{ model: string; modelConfig: string }> => {
		let modelConfig = '<?xml version="1.0" encoding="UTF-8"?>\n<config>\n'
		modelConfig += ` <object id="1" type="model">\n`
		modelConfig += `  <metadata type="object" key="name" value="Map"/>\n`

		const colorToExtruder: Map<string, string> = new Map()
		const single3mf = serialize({ compress: false }, geometries)[0]
		const parser = new DOMParser()
		const parsed3mf = parser.parseFromString(single3mf, "application/xml")
		const objects = parsed3mf.getElementsByTagName("object")

		const allVertices: Map<string, number> = new Map()
		const allTriangles = []

		for (const [index, geom3] of geometries.entries()) {
			const numberOfTrianglesAtStart = allTriangles.length
			const object = objects[index]
			const vertices = object.getElementsByTagName("vertex")
			for (const vertex of vertices) {
				const x = vertex.getAttribute("x")
				const y = vertex.getAttribute("y")
				const z = vertex.getAttribute("z")
				const newVertex = `<vertex x="${x}" y="${y}" z="${z}"/>`
				if (!allVertices.has(newVertex)) {
					allVertices.set(newVertex, allVertices.size)
				}
			}
			const triangles = object.getElementsByTagName("triangle")
			for (const triangle of triangles) {
				const v1 = vertices[Number.parseInt(triangle.getAttribute("v1"))]
				const vertex1 = `<vertex x="${v1.getAttribute("x")}" y="${v1.getAttribute("y")}" z="${v1.getAttribute("z")}"/>`

				const v2 = vertices[Number.parseInt(triangle.getAttribute("v2"))]
				const vertex2 = `<vertex x="${v2.getAttribute("x")}" y="${v2.getAttribute("y")}" z="${v2.getAttribute("z")}"/>`

				const v3 = vertices[Number.parseInt(triangle.getAttribute("v3"))]
				const vertex3 = `<vertex x="${v3.getAttribute("x")}" y="${v3.getAttribute("y")}" z="${v3.getAttribute("z")}"/>`

				allTriangles.push(
					`<triangle v1="${allVertices.get(vertex1)}" v2="${allVertices.get(vertex2)}" v3="${allVertices.get(vertex3)}"/>`
				)
			}

			modelConfig += `  <volume firstid="${numberOfTrianglesAtStart}" lastid="${allTriangles.length - 1}">\n`
			const color = geom3.color
			const colorString = color === undefined ? "uncolored" : color.toString()
			if (!colorToExtruder.has(colorString)) {
				colorToExtruder.set(colorString, (colorToExtruder.size + 1).toString())
			}
			const extruder = colorToExtruder.get(colorString)
			modelConfig += `   <metadata type="volume" key="extruder" value="${extruder}"/>\n`
			modelConfig += `   <metadata type="volume" key="source_object_id" value="${index + 1}"/>\n`
			modelConfig += `   <metadata type="volume" key="source_volume_id" value="0"/>\n`
			modelConfig += "  </volume>\n"
		}

		modelConfig += " </object>\n"
		modelConfig += "</config>"

		const model = this.buildModel(allVertices, allTriangles)

		return { model, modelConfig }
	}

	buildModel = (allVertices, allTriangles): string => {
		let model = '<?xml version="1.0" encoding="UTF-8"?>\n'
		model +=
			'<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06">\n'
		model += ' <metadata name="Application">CodeCharta-JSCAD</metadata>\n'
		model += ` <metadata name="CreationDate">${new Date().toISOString()}</metadata>\n`
		model += " <resources>\n"
		model += '  <object id="1" type="model">\n'
		model += "   <mesh>\n"

		model += `    <vertices>\n`
		for (const vertex of allVertices) {
			model += `     ${vertex}\n`
		}
		model += `    </vertices>\n`

		model += `    <triangles>\n`
		for (const triangle of allTriangles) {
			model += `     ${triangle}\n`
		}
		model += `    </triangles>\n`

		model += `   </mesh>\n`
		model += `  </object>\n`
		model += ` </resources>\n`
		model += ` <build>\n`
		model += `  <item objectid="1"/>\n`
		model += ` </build>\n`
		model += `</model>`

		return model
	}

	maps = (xyScalingFactor, zScalingFactor, baseplateHeight): Geom3[] => {
		const nodes = this.threeSceneService.getMapMesh().getNodes()
		return nodes.map(node => {
			const size: Vec3 = [node.length, node.width, node.height]
			size[0] *= xyScalingFactor
			size[1] *= xyScalingFactor
			size[2] *= zScalingFactor

			const center: Vec3 = [node.y0 + node.length / 2, node.x0 + node.width / 2, node.z0 + node.height / 2]
			center[0] = center[0] * xyScalingFactor
			center[1] = center[1] * xyScalingFactor
			center[2] = center[2] * zScalingFactor + baseplateHeight

			const color = node.isLeaf ? this.hexToNamedColor(node.color) : "gray"

			let cuboid = primitives.cuboid({ center, size })
			cuboid = colorize(colorNameToRgb(color), cuboid)
			return cuboid
		})
	}

	baseplate = (x, y, z, mapSideOffset, roundRadius = Number.MAX_VALUE): Geom3 => {
		const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
		if (maxRoundRadius < roundRadius) {
			roundRadius = maxRoundRadius
		}

		const flatBaselate = roundedRectangle({ size: [x, y], roundRadius, center: [x / 2 - mapSideOffset, y / 2 - mapSideOffset] })
		let baseplate = extrudeLinear({ height: z }, flatBaselate)
		baseplate = colorize(colorNameToRgb("gray"), baseplate)
		return baseplate
	}

	createText = (text, position: Vec3, size = 6, height = 1, characterLineWidth = 1.5, color = "white", rotate = 180) => {
		const lineRadius = characterLineWidth / 2
		const lineCorner = circle({ radius: lineRadius })

		const lineSegmentPointArrays = vectorText({ height: size, align: "center", input: text }) // line segments for each character
		const lineSegments = []
		for (const segmentPoints of lineSegmentPointArrays) {
			// process the line segment
			const corners = segmentPoints.map(point => translate(point, lineCorner))
			lineSegments.push(hullChain(corners))
		}
		const message2D = union(lineSegments)
		let textModel = extrudeLinear({ height }, message2D)
		textModel = rotateZ(degToRad(rotate), textModel)
		position[2] = position[2] + height / 2
		textModel = center({ relativeTo: position }, textModel)
		textModel = colorize(colorNameToRgb(color), textModel)
		return textModel
	}

	/*
	const backside = (thickness = 0.6) => {
		const back = union(
			logo("logos/mw_logo_text.svg", -20, 10, 0, thickness),
			translate([15, 60, 0],
				union(
					logo("icons/area.svg", 0, 30-1, 0, 8, 8, thickness),
					logo("icons/height.svg", 0, 15-1, 0, 8, 8, thickness),
					logo("icons/color.svg", 0, -1, 0, 8, 8, thickness),
					print("rloc (total: 338,540 real lines)", 15, 30, 0, 6, thickness, "Liberation Mono:style=Bold"),
					print("mcc  (min: 0, max: 338)", 15, 15, 0, 6, thickness, "Liberation Mono:style=Bold"),
					print("test line coverage", 15, 0, 0, 6, thickness, "Liberation Mono:style=Bold"),
					print("     (0-33% / 33-66% / 66-100%)", 15, -10, 0, 6, thickness, "Liberation Mono:style=Bold")
				)
			),
			print("IT Stabilization & Modernization", baseplate_x / 2, 135, 0, 8, thickness, "Arial:style=Bold", "center"),
			print("maibornwolff.de/service/it-sanierung", baseplate_x / 2, 122, 0, 6, thickness, "Arial:style=Bold", "center"),
			print("maibornwolff.github.io/codecharta", baseplate_x / 2, 20, 0, 6, thickness, "Arial:style=Bold", "center")
		);
		return translate([baseplate_x, 0, -0.01], mirror([1,0,0], back));
	}
	*/

	logo = async (file: string, positionOfUpperLeftCorner: Vec3, size: Vec3, color = "white", rotate = 180): Promise<Geom3> => {
		const svgData = await firstValueFrom(this.httpClient.get(`codeCharta/assets/${file}`, { responseType: "text" }).pipe(timeout(5000)))
		const svgModels = deserialize({ output: "geometry", addMetaData: false, target: "geom2", pathSelfClosed: "trim" }, svgData)
		const models: Geom3[] = svgModels.map(object => {
			return extrudeLinear({ height: size[2] }, object)
		})

		let model: Geom3 = intersect(models) //normally I would have used "union" here - but somehow union and intersect seem to be mistakenly swapped in this library
		model = scale([size[0], size[1], 1], model)
		model = rotateZ(degToRad(rotate), model)
		const centerPosition: Vec3 = [
			positionOfUpperLeftCorner[0] - size[0] * 20,
			positionOfUpperLeftCorner[1],
			positionOfUpperLeftCorner[2] + size[2] / 2
		]
		model = center({ relativeTo: centerPosition }, model)
		model = colorize(colorNameToRgb(color), model)
		return model
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
