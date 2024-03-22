import { strToU8, zipSync } from "fflate"
import { BufferGeometry } from "three"
import { ThreeSceneService } from "../../ui/codeMap/threeViewer/threeSceneService"

export async function serialize3mf(threeSceneService: ThreeSceneService): Promise<string> {
	const { modelConfig, vertices, triangles } = await serializeGeometriesAndBuildModelConfig(
		threeSceneService.getMapMesh().getThreeMesh().geometry
	)
	const model = buildModel(vertices, triangles)
	const contentType = buildContentType()

	const data = {
		"3D": {
			"3dmodel.model": strToU8(model)
		},
		Metadata: {
			"Slic3r_PE_model.config": strToU8(modelConfig)
		},
		"[Content_Types].xml": strToU8(contentType)
	}
	const options = {
		comment: "created by CodeCharta"
	}

	const compressed3mf = zipSync(data, options).buffer
	return compressed3mf as unknown as string
}

function buildContentType(): string {
	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		` <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n` +
		`  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n` +
		`  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n` +
		`  <Default Extension="png" ContentType="image/png"/>\n` +
		` </Types>`
	)
}

function serializeGeometriesAndBuildModelConfig(geometry: BufferGeometry): {
	modelConfig: string
	vertices: string[]
	triangles: string[]
} {
	let modelConfig = buildModelConfigHeader()

	const vertices = []
	const triangles = []
	const vertexToNewVertexIndex: Map<string, number> = new Map()
	const vertexIndexToNewVertexIndex: Map<number, number> = new Map()
	const colorToExtruder: Map<string, number> = new Map()
	let volumeCount = 1

	const colorNodeGroups = groupVerticesByColor(geometry)

	for (const { color, vertexIndexes } of colorNodeGroups) {
		const firstTriangleId = triangles.length

		const { firstVertexId, lastVertexId } = buildVertices(
			vertices,
			vertexToNewVertexIndex,
			vertexIndexToNewVertexIndex,
			vertexIndexes,
			geometry
		)

		buildTriangles(triangles, vertexIndexToNewVertexIndex, geometry, firstVertexId, lastVertexId)

		modelConfig += buildVolume(color, firstTriangleId, triangles.length - 1, colorToExtruder, volumeCount)

		volumeCount++
	}

	modelConfig += buildModelConfigFooter()

	return { modelConfig, vertices, triangles }
}

function buildVolume(color, firstTriangleId, lastTriangleId, colorToExtruder, volumeId) {
	let volume = `  <volume firstid="${firstTriangleId}" lastid="${lastTriangleId}">\n`

	const colorString = color ? color.toString() : "no_color"
	if (!colorToExtruder.has(colorString)) {
		colorToExtruder.set(colorString, colorToExtruder.size + 1)
	}
	const extruder = colorToExtruder.get(colorString)
	volume += `   <metadata type="volume" key="name" value="${colorString}"/>\n`
	volume += `   <metadata type="volume" key="extruder" value="${extruder}"/>\n`
	volume += `   <metadata type="volume" key="source_object_id" value="1"/>\n`
	volume += `   <metadata type="volume" key="source_volume_id" value="${volumeId}"/>\n`
	volume += "  </volume>\n"

	return volume
}

function buildTriangles(triangles, vertexIndexToNewVertexIndex, geometry, firstVertexId, lastVertexId): void {
	if (!geometry.index) {
		console.warn("No index attribute found. Using position attribute to generate triangles, this could result in open edges.")
		for (let index = 0; index < geometry.attributes.position.count; index += 3) {
			const triangle = `<triangle v1="${index}" v2="${index + 1}" v3="${index + 2}" />\n`
			triangles.push(triangle)
		}
	} else {
		const indexAttribute = geometry.index
		for (let index = 0; index < indexAttribute.count; index += 3) {
			const index1 = indexAttribute.getX(index)
			const index2 = indexAttribute.getY(index)
			const index3 = indexAttribute.getZ(index)

			if (
				index1 >= firstVertexId &&
				index1 <= lastVertexId &&
				index2 >= firstVertexId &&
				index2 <= lastVertexId &&
				index3 >= firstVertexId &&
				index3 <= lastVertexId
			) {
				const triangle = `<triangle v1="${vertexIndexToNewVertexIndex.get(index1)}" v2="${vertexIndexToNewVertexIndex.get(
					index2
				)}" v3="${vertexIndexToNewVertexIndex.get(index3)}" />\n`
				triangles.push(triangle)
			}
		}
	}
}

function buildVertices(
	vertices,
	vertexToNewVertexIndex,
	vertexIndexToNewVertexIndex,
	vertexIndexes,
	geometry
): { firstVertexId: number; lastVertexId: number } {
	const firstVertexId = vertexIndexToNewVertexIndex.size

	const positionAttribute = geometry.attributes.position
	for (const vertexIndex of vertexIndexes) {
		const vertex = [positionAttribute.getX(vertexIndex), positionAttribute.getY(vertexIndex), positionAttribute.getZ(vertexIndex)]
		const vertexString = `<vertex x="${vertex[0]}" y="${vertex[1]}" z="${vertex[2]}"/>\n`
		if (!vertexToNewVertexIndex.has(vertexString)) {
			vertices.push(vertexString)
			vertexToNewVertexIndex.set(vertexString, vertices.length - 1)
			vertexIndexToNewVertexIndex.set(vertexIndex, vertices.length - 1)
		} else {
			vertexIndexToNewVertexIndex.set(vertexIndex, vertexToNewVertexIndex.get(vertexString))
		}
	}

	return { firstVertexId, lastVertexId: vertexIndexToNewVertexIndex.size - 1 }
}

function buildModelConfigHeader(): string {
	let modelConfig = '<?xml version="1.0" encoding="UTF-8"?>\n<config>\n'
	modelConfig += ` <object id="1" type="model">\n`
	modelConfig += `  <metadata type="object" key="name" value="Map"/>\n`
	return modelConfig
}

function buildModelConfigFooter(): string {
	let modelConfigFooter = " </object>\n"
	modelConfigFooter += "</config>"
	return modelConfigFooter
}

function groupVerticesByColor(geometry: BufferGeometry): { color: string; vertexIndexes: number[] }[] {
	const colorNodeGroups: { color: string; vertexIndexes: number[] }[] = []

	for (let index = 0; index < geometry.attributes.color.count; index++) {
		const hexColorString = processColorArray(geometry, index)
		const colorNodeGroup = colorNodeGroups.find(cng => cng.color === hexColorString)

		if (colorNodeGroup) {
			colorNodeGroup.vertexIndexes.push(index)
		} else {
			colorNodeGroups.push({ color: hexColorString, vertexIndexes: [index] })
		}
	}

	return colorNodeGroups
}

function processColorArray(geometry: BufferGeometry, index: number): string {
	const colorsArray = [
		geometry.attributes.color.getX(index),
		geometry.attributes.color.getY(index),
		geometry.attributes.color.getZ(index)
	]

	if (colorsArray[0] === colorsArray[1] && colorsArray[1] === colorsArray[2]) {
		colorsArray[0] = 0.5
		colorsArray[1] = 0.5
		colorsArray[2] = 0.5
	}

	return colorsArray
		.map(c =>
			Math.round(c * 255)
				.toString(16)
				.padStart(2, "0")
		)
		.join("")
}

function buildModel(vertices, triangles): string {
	const modelHeader = buildModelHeader()
	const verticesString = buildModelVertices(vertices)
	const trianglesString = buildModelTriangles(triangles)
	const modelFooter = buildModelFooter()

	return modelHeader + verticesString + trianglesString + modelFooter
}

function buildModelHeader(): string {
	let model = '<?xml version="1.0" encoding="UTF-8"?>\n'
	model +=
		'<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06">\n'
	model += ' <metadata name="Application">CodeCharta-JSCAD</metadata>\n'
	model += " <resources>\n"
	model += '  <object id="1" type="model">\n'
	model += "   <mesh>\n"
	return model
}

function buildModelVertices(vertices): string {
	let verticesString = `    <vertices>\n`
	for (const vertex of vertices) {
		verticesString += `     ${vertex}`
	}
	verticesString += `    </vertices>\n`
	return verticesString
}

function buildModelTriangles(triangles): string {
	let trianglesString = `    <triangles>\n`
	for (const triangle of triangles) {
		trianglesString += `     ${triangle}`
	}
	trianglesString += `    </triangles>\n`
	return trianglesString
}

function buildModelFooter(): string {
	let modelFooter = `   </mesh>\n`
	modelFooter += `  </object>\n`
	modelFooter += ` </resources>\n`
	modelFooter += ` <build>\n`
	modelFooter += `  <item objectid="1"/>\n`
	modelFooter += ` </build>\n`
	modelFooter += `</model>`
	return modelFooter
}

/*

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

const print = (txt, x, y, z, size, t, font = "Arial", halign = "left", valign = "baseline") => {
	const txtModel = text({text: txt, height: t, align: halign, valign, font, size});
	return translate([x, y, z], txtModel);
}



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

const mcolor = (c) => {
	return (geometry) => color(c, geometry);
}


logo = async (file: string, positionOfUpperLeftCorner: Vec3, size: Vec3, rotate = 0, color = "white"): Promise<Geom3> => {
	const svgData = await firstValueFrom(this.httpClient.get(`codeCharta/assets/${file}`, { responseType: "text" }).pipe(timeout(5000)))
	const svgModels: Geom2[] = deserialize({ output: "geometry", addMetaData: false, target: "geom2", pathSelfClosed: "trim" }, svgData)
	const models: Geom3[] = svgModels.map(object => {
		return extrudeLinear({ height: size[2] }, object)
	})

	let model: Geom3 = union(models) //normally I would have used "union" here - but somehow union and intersect seem to be mistakenly swapped in this library
	model = scale([size[0], size[1], 1], model)
	model = rotateZ((rotate / 180) * Math.PI, model)
	const centerPosition: Vec3 = [
		positionOfUpperLeftCorner[0] - size[0] * 20,
		positionOfUpperLeftCorner[1],
		positionOfUpperLeftCorner[2] + size[2] / 2
	]
	model = center({ relativeTo: centerPosition }, model)
	model = colorize(colorNameToRgb(color), model)
	return model
}*/
