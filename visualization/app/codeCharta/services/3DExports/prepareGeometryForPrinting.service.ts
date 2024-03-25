import { BufferGeometry, DoubleSide, ExtrudeGeometry, FontLoader, Mesh, MeshBasicMaterial, Shape, TextGeometry } from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"

export interface GeometryOptions {
	width: number
	frontText?: string
	zScale?: number
	mapSideOffset?: number
	baseplateHeight?: number
}

export async function prepareGeometryForPrinting(mapMesh: Mesh, geometryOptions: GeometryOptions): Promise<Mesh> {
	geometryOptions.mapSideOffset = geometryOptions.mapSideOffset || 10
	geometryOptions.baseplateHeight = geometryOptions.baseplateHeight || 1
	geometryOptions.zScale = geometryOptions.zScale || 1

	const printMesh: Mesh = new Mesh()
	printMesh.clear()

	const map = prepareMap(mapMesh.geometry.clone(), geometryOptions)
	const newMapMesh: Mesh = mapMesh.clone() as Mesh
	newMapMesh.clear()
	newMapMesh.geometry = map
	printMesh.attach(newMapMesh)

	const baseplateMesh = baseplate(geometryOptions)
	printMesh.attach(baseplateMesh)

	if (geometryOptions.frontText) {
		try {
			const frontTextMesh = await frontText(geometryOptions)
			printMesh.attach(frontTextMesh)
		} catch (error) {
			console.error("Error creating text:", error)
		}
	}

	const mwLogo = await createMWLogo(geometryOptions)
	printMesh.attach(mwLogo)

	return printMesh
}

function prepareMap(map: BufferGeometry, geometryOptions): BufferGeometry {
	const width = geometryOptions.width - 2 * geometryOptions.mapSideOffset

	//rotate 90 degrees around x-axis so map is horizontal
	map.rotateX(Math.PI / 2)

	//scale
	const normalizeFactor = map.boundingBox.max.x
	const xyScale = width / normalizeFactor
	map.scale(xyScale, xyScale, geometryOptions.zScale * xyScale)

	map.rotateZ(-Math.PI / 2)
	map.translate(width + geometryOptions.mapSideOffset, 0, geometryOptions.baseplateHeight)
	return map
}

function baseplate(geometryOptions): Mesh {
	const mapSideOffset = geometryOptions.mapSideOffset

	let edgeRadius = 5 // Adjust this value to change the roundness of the corners
	const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
	if (maxRoundRadius < edgeRadius) {
		edgeRadius = maxRoundRadius
	}

	// Create the shape
	const shape = new Shape()
	const width = geometryOptions.width

	shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false)
	shape.absarc(width - edgeRadius, mapSideOffset + width - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false)
	shape.absarc(edgeRadius, mapSideOffset + width - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false)
	shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false)

	// Create the geometry
	const geometry = new ExtrudeGeometry(shape, { depth: geometryOptions.baseplateHeight, bevelEnabled: false })
	geometry.translate(0, -width, 0)

	// Create the material
	const material = new MeshBasicMaterial({ color: 0xff_00_00 })

	// Create the mesh
	const baseplateMesh = new Mesh(geometry, material)
	baseplateMesh.name = "Baseplate"

	return baseplateMesh
}

async function frontText(geometryOptions): Promise<Mesh> {
	const textGeometry = await createTextGeometry(geometryOptions.frontText)
	//calculate the bounding box of the text
	textGeometry.computeBoundingBox()
	const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
	const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
	const x = (geometryOptions.width - textWidth) / 2
	const y = -geometryOptions.width + textHeight / 2
	textGeometry.translate(x, y, geometryOptions.baseplateHeight)

	const material = new MeshBasicMaterial({ color: 0x00_00_ff })
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
					size: 12,
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

async function createMWLogo(geometryOptions): Promise<Mesh> {
	const mwLogoGeometry = await createSvgGeometry("mw_logo.svg", 1)

	mwLogoGeometry.rotateZ(Math.PI)
	mwLogoGeometry.scale(0.13, 0.13, 1)
	mwLogoGeometry.translate(
		geometryOptions.width + geometryOptions.mapSideOffset + 5,
		-geometryOptions.width + geometryOptions.mapSideOffset + 43,
		geometryOptions.baseplateHeight
	)

	const material = new MeshBasicMaterial({ color: 0x00_00_ff, side: DoubleSide })
	const logoMesh = new Mesh(mwLogoGeometry, material)
	logoMesh.name = "MW Logo"
	return logoMesh
}

async function createSvgGeometry(fileName: string, depth): Promise<BufferGeometry> {
	const filePath = `codeCharta/assets/${fileName}`
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
							depth,
							bevelEnabled: false
						})
						geometries.push(geometry)
					}
				}

				const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
				resolve(mergedGeometry)
			},
			undefined,
			function (error) {
				console.error(`Error loading ${fileName}`)
				reject(error)
			}
		)
	})
}
