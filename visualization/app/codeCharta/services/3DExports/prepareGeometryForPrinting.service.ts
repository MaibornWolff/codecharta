import {
	BufferGeometry,
	DoubleSide,
	ExtrudeGeometry,
	Float32BufferAttribute,
	FontLoader,
	Mesh,
	MeshBasicMaterial,
	Shape,
	TextGeometry
} from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"

const frontTextSize = 12
const mapSideOffset = 10
const baseplateHeight = 1
const logoSize = 15
const logoHeight = 1

export interface GeometryOptions {
	width: number
	frontText?: string
}

export async function createPrintPreviewMesh(mapMesh: Mesh, geometryOptions: GeometryOptions): Promise<Mesh> {
	const printMesh: Mesh = new Mesh()
	printMesh.name = "PrintMesh"
	printMesh.clear()

	const newMapMesh = createMapMesh(mapMesh, geometryOptions)
	printMesh.add(newMapMesh)

	const baseplateMesh = createBaseplateMesh(geometryOptions)
	printMesh.add(baseplateMesh)

	if (geometryOptions.frontText) {
		try {
			const frontTextMesh = await createFrontText(geometryOptions)
			printMesh.attach(frontTextMesh)
		} catch (error) {
			console.error("Error creating text:", error)
		}
	}

	const mwLogo = await createMWLogo(geometryOptions)
	printMesh.attach(mwLogo)

	return printMesh
}

export function updateMapSize(printMesh: Mesh, currentWidth: number, wantedWidth: number) {
	printMesh.traverse(object => {
		if (!(object instanceof Mesh)) {
			return
		}
		const child = object as Mesh
		switch (child.name) {
			case "Map": {
				const map = child.geometry
				const scale = (wantedWidth - 2 * mapSideOffset) / (currentWidth - 2 * mapSideOffset)
				map.scale(scale, scale, scale)
				break
			}
			case "Baseplate": {
				const baseplateGeometry: BufferGeometry = createBaseplateGeometry({ width: wantedWidth })
				child.geometry = baseplateGeometry
				break
			}
			case "FrontText": {
				const text = child.geometry
				text.translate(0, -(wantedWidth - currentWidth) / 2, 0)
				break
			}
			case "MW Logo": {
				const logo = child.geometry
				logo.translate((wantedWidth - currentWidth) / 2, -(wantedWidth - currentWidth) / 2, 0)
				break
			}
			case "Custom Logo":
				updateCustomLogoPosition(child, wantedWidth)
				break
		}
	})
}

export async function addCustomLogo(printMesh: Mesh, dataUrl: string, width: number): Promise<void> {
	const customLogoMesh = await createSvgMesh(dataUrl, logoHeight, logoSize)

	updateCustomLogoPosition(customLogoMesh, width)
	customLogoMesh.name = "Custom Logo"

	printMesh.attach(customLogoMesh)
}
function updateCustomLogoPosition(customLogoMesh: Mesh, width: number) {
	customLogoMesh.geometry.computeBoundingBox()
	const boundingBox = customLogoMesh.geometry.boundingBox
	const logoWidth = boundingBox.max.x - boundingBox.min.x
	const logoDepth = boundingBox.max.y - boundingBox.min.y
	customLogoMesh.position.set(-width / 2 + logoWidth + mapSideOffset, -logoDepth / 2 - (width - mapSideOffset) / 2, 0)
}
export function rotateCustomLogo(printMesh: Mesh) {
	const logoMesh = printMesh.getObjectByName("Custom Logo") as Mesh
	if (logoMesh) {
		logoMesh.rotateZ(Math.PI / 2) // Rotate 90 degrees
	}
}
export function flipCustomLogo(printMesh: Mesh) {
	const logoMesh = printMesh.getObjectByName("Custom Logo") as Mesh
	if (logoMesh) {
		logoMesh.rotateY(Math.PI) // Rotate 180 degrees
	}
}

export async function updateFrontText(printMesh: Mesh, frontText: string, width) {
	printMesh.remove(printMesh.getObjectByName("FrontText"))
	const text = await createFrontText({ frontText, width })
	printMesh.attach(text)
}

function createMapMesh(mapMesh: Mesh, geometryOptions: GeometryOptions): Mesh {
	const oldMapMesh = mapMesh.geometry.clone()
	oldMapMesh.rotateX(Math.PI / 2)
	const map = createMapGeometry(oldMapMesh, geometryOptions)
	map.rotateZ(-Math.PI / 2)
	const newMapMesh: Mesh = mapMesh.clone() as Mesh
	newMapMesh.clear()
	newMapMesh.geometry = map
	newMapMesh.name = "Map"
	return newMapMesh
}
function createMapGeometry(map: BufferGeometry, geometryOptions: GeometryOptions): BufferGeometry {
	const width = geometryOptions.width - 2 * mapSideOffset

	//scale
	const normalizeFactor = map.boundingBox.max.x
	const scale = width / normalizeFactor
	map.scale(scale, scale, scale)

	map.translate(-width / 2, width / 2, 0)

	const newColors = []

	for (let index = 0; index < map.attributes.color.count; index++) {
		const colorR = map.attributes.color.getX(index)
		const colorG = map.attributes.color.getY(index)
		const colorB = map.attributes.color.getZ(index)
		let newColor: number[]

		if (colorR === colorB && colorR === colorG && colorG === colorB) {
			newColor = [0.5, 0.5, 0.5]
		} else if (colorR > 0.75 && colorG > 0.75) {
			newColor = [1, 1, 0]
		} else if (colorR > 0.45 && colorG < 0.1) {
			newColor = [1, 0, 0]
		} else if (colorR < 5 && colorG > 0.6) {
			newColor = [0, 1, 0]
		} else {
			console.error("Unknown color")
		}
		newColors.push(...newColor)
	}
	map.setAttribute("color", new Float32BufferAttribute(newColors, 3))

	return map
}

function createBaseplateMesh(geometryOptions: GeometryOptions): Mesh {
	const geometry = createBaseplateGeometry(geometryOptions)
	const material = new MeshBasicMaterial({ color: 0x80_80_80 })
	const baseplateMesh = new Mesh(geometry, material)
	baseplateMesh.name = "Baseplate"
	return baseplateMesh
}
function createBaseplateGeometry(geometryOptions: GeometryOptions): BufferGeometry {
	let edgeRadius = 5 // Adjust this value to change the roundness of the corners
	const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
	if (maxRoundRadius < edgeRadius) {
		edgeRadius = maxRoundRadius
	}

	// Create the shape
	const shape = new Shape()
	const width = geometryOptions.width

	shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false)
	shape.absarc(width - edgeRadius, frontTextSize + width - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false)
	shape.absarc(edgeRadius, frontTextSize + width - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false)
	shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false)

	// Create the geometry
	const geometry = new ExtrudeGeometry(shape, { depth: baseplateHeight, bevelEnabled: false })
	geometry.translate(-width / 2, -width / 2 - frontTextSize, -baseplateHeight)

	return geometry
}

async function createFrontText(geometryOptions: GeometryOptions): Promise<Mesh> {
	const textGeometry = await createTextGeometry(geometryOptions.frontText)
	textGeometry.center()

	//calculate the bounding box of the text
	textGeometry.computeBoundingBox()
	const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
	textGeometry.translate(0, -textDepth / 2 - (geometryOptions.width - mapSideOffset) / 2, 0)

	const material = new MeshBasicMaterial({ color: 0xff_ff_ff })
	const textMesh = new Mesh(textGeometry, material)
	textMesh.name = "FrontText"
	return textMesh
}
async function createTextGeometry(text: string): Promise<TextGeometry> {
	return new Promise((resolve, reject) => {
		const loader = new FontLoader()
		loader.load(
			"codeCharta/assets/helvetiker_regular.typeface.json",
			function (font) {
				const textGeometry = new TextGeometry(text, {
					font,
					size: frontTextSize,
					height: 1
				})
				resolve(textGeometry)
			},
			undefined,
			function (error) {
				console.error("Error loading font:")
				reject(error)
			}
		)
	})
}

async function createMWLogo(geometryOptions: GeometryOptions): Promise<Mesh> {
	const fileName = "mw_logo.svg"
	const filePath = `codeCharta/assets/${fileName}`

	const mwLogoMesh = await createSvgMesh(filePath, logoHeight, logoSize)

	mwLogoMesh.geometry.computeBoundingBox()
	const boundingBox = mwLogoMesh.geometry.boundingBox
	const logoWidth = boundingBox.max.x - boundingBox.min.x
	const logoDepth = boundingBox.max.y - boundingBox.min.y
	mwLogoMesh.position.set(
		geometryOptions.width / 2 - logoWidth - mapSideOffset,
		-logoDepth / 2 - (geometryOptions.width - mapSideOffset) / 2,
		0
	)

	mwLogoMesh.name = "MW Logo"
	return mwLogoMesh
}
async function createSvgMesh(filePath: string, height: number, size: number): Promise<Mesh> {
	const svgGeometry = await createSvgGeometry(filePath)
	svgGeometry.center()
	svgGeometry.rotateZ(Math.PI)
	svgGeometry.rotateY(Math.PI)
	svgGeometry.scale(size, size, height)

	const material = new MeshBasicMaterial({ color: 0xff_ff_ff, side: DoubleSide })
	const svgMesh = new Mesh(svgGeometry, material)
	svgMesh.name = "Unnamed SVG Mesh"
	return svgMesh
}
async function createSvgGeometry(filePath: string): Promise<BufferGeometry> {
	//load the svg file
	const loader = new SVGLoader()
	return new Promise((resolve, reject) => {
		loader.load(
			filePath,
			function (data) {
				const paths = data.paths
				const geometries: BufferGeometry[] = []

				for (const path of paths) {
					const shapes = path.toShapes(false, false)

					for (const shape of shapes) {
						const geometry = new ExtrudeGeometry(shape, {
							depth: 1,
							bevelEnabled: false
						})
						geometries.push(geometry)
					}
				}

				const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)

				mergedGeometry.computeBoundingBox()
				const width = mergedGeometry.boundingBox.max.x - mergedGeometry.boundingBox.min.x
				const depth = mergedGeometry.boundingBox.max.y - mergedGeometry.boundingBox.min.y
				const scale = 1 / Math.max(width, depth)
				mergedGeometry.scale(scale, scale, 1)

				resolve(mergedGeometry)
			},
			undefined,
			function (error) {
				console.error(`Error loading ${filePath}`)
				reject(error)
			}
		)
	})
}
