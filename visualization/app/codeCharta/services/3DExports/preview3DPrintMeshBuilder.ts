import {
	BufferGeometry,
	DoubleSide,
	ExtrudeGeometry,
	Float32BufferAttribute,
	Font,
	FontLoader,
	Mesh,
	MeshBasicMaterial,
	Shape,
	TextGeometry
} from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { ColorRange, NodeMetricData } from "../../codeCharta.model"

const frontTextSize = 12
const frontTextHeight = 1
const mapSideOffset = 10
const baseplateHeight = 1
const logoSize = 15
const logoHeight = 1
const backTextSize = 6

export interface GeometryOptions {
	width: number
	areaMetricTitle: string
	areaMetricData: NodeMetricData
	heightMetricTitle: string
	heightMetricData: NodeMetricData
	colorMetricTitle: string
	colorMetricData: NodeMetricData
	colorRange: ColorRange
	frontText?: string
}

export class preview3DPrintMeshBuilder {
	private font: Font

	async initialize() {
		const loader = new FontLoader()
		return new Promise<void>((resolve, reject) => {
			loader.load(
				"codeCharta/assets/helvetiker_regular.typeface.json",
				loadedFont => {
					this.font = loadedFont
					resolve()
				},
				undefined,
				function (error) {
					console.error("Error loading font:", error)
					reject(error)
				}
			)
		})
	}

	async createPrintPreviewMesh(mapMesh: Mesh, geometryOptions: GeometryOptions): Promise<Mesh> {
		const printMesh: Mesh = new Mesh()
		printMesh.name = "PrintMesh"
		printMesh.clear()

		const newMapMesh = this.createMapMesh(mapMesh, geometryOptions)
		printMesh.add(newMapMesh)

		const baseplateMesh = this.createBaseplateMesh(geometryOptions.width)
		printMesh.add(baseplateMesh)

		if (geometryOptions.frontText) {
			try {
				const frontTextMesh = this.createFrontText(geometryOptions.frontText, geometryOptions.width)
				printMesh.attach(frontTextMesh)
			} catch (error) {
				console.error("Error creating text:", error)
			}
		}

		const mwLogo = await this.createFrontMWLogo(geometryOptions)
		printMesh.add(mwLogo)

		const backTextMesh = await this.createMetricsMesh(geometryOptions)
		printMesh.add(backTextMesh)

		const codeChartaMesh = await this.createCodeChartaMesh(geometryOptions)
		printMesh.add(codeChartaMesh)

		const backMWMesh = await this.createBackMW(geometryOptions)
		printMesh.add(backMWMesh)

		return printMesh
	}

	updateMapSize(printMesh: Mesh, currentWidth: number, wantedWidth: number) {
		for (const object of printMesh.children) {
			if (!(object instanceof Mesh)) {
				return
			}
			const child = object as Mesh
			switch (child.name) {
				case "PrintMesh":
					break

				case "Map": {
					const map = child.geometry
					const scale = (wantedWidth - 2 * mapSideOffset) / (currentWidth - 2 * mapSideOffset)
					map.scale(scale, scale, scale)
					break
				}
				case "Baseplate": {
					const baseplateGeometry: BufferGeometry = this.createBaseplateGeometry(wantedWidth)
					child.geometry = baseplateGeometry
					break
				}
				case "FrontText": {
					const text = child.geometry
					text.translate(0, -(wantedWidth - currentWidth) / 2, 0)
					break
				}
				case "Front MW Logo": {
					const logo = child.geometry
					logo.translate((wantedWidth - currentWidth) / 2, -(wantedWidth - currentWidth) / 2, 0)
					break
				}
				case "Custom Logo":
					this.updateCustomLogoPosition(child, wantedWidth)
					break

				case "Metric Text":
					child.visible = this.scaleAndCenterBack(child, wantedWidth, wantedWidth / currentWidth)
					break

				case "CodeCharta Logo":
					child.visible = this.scaleAndCenterBack(child, wantedWidth, wantedWidth / currentWidth)
					break

				case "Back MW Logo":
					child.visible = this.scaleAndCenterBack(child, wantedWidth, wantedWidth / currentWidth)
					break

				default:
					console.warn("Unknown object:", child.name, "Did you forget to add it to the updateMapSize method?")
					break
			}
		}
	}

	async addCustomLogo(printMesh: Mesh, dataUrl: string, width: number): Promise<void> {
		const customLogoMesh = await this.createSvgMesh(dataUrl, logoHeight, logoSize)

		this.updateCustomLogoPosition(customLogoMesh, width)
		customLogoMesh.name = "Custom Logo"

		printMesh.attach(customLogoMesh)
	}

	rotateCustomLogo(printMesh: Mesh) {
		const logoMesh = printMesh.getObjectByName("Custom Logo") as Mesh
		if (logoMesh) {
			logoMesh.rotateZ(Math.PI / 2) // Rotate 90 degrees
		}
	}

	flipCustomLogo(printMesh: Mesh) {
		const logoMesh = printMesh.getObjectByName("Custom Logo") as Mesh
		if (logoMesh) {
			logoMesh.rotateY(Math.PI) // Rotate 180 degrees
		}
	}

	updateFrontText(printMesh: Mesh, frontText: string, width) {
		printMesh.remove(printMesh.getObjectByName("FrontText"))
		const text = this.createFrontText(frontText, width)
		printMesh.attach(text)
	}

	private updateCustomLogoPosition(customLogoMesh: Mesh, width: number) {
		customLogoMesh.geometry.computeBoundingBox()
		const boundingBox = customLogoMesh.geometry.boundingBox
		const logoWidth = boundingBox.max.x - boundingBox.min.x
		const logoDepth = boundingBox.max.y - boundingBox.min.y
		customLogoMesh.position.set(-width / 2 + logoWidth + mapSideOffset, -logoDepth / 2 - (width - mapSideOffset) / 2, logoHeight / 2)
	}

	private createMapMesh(mapMesh: Mesh, geometryOptions: GeometryOptions): Mesh {
		const oldMapMesh = mapMesh.geometry.clone()
		oldMapMesh.rotateX(Math.PI / 2)
		const map = this.createMapGeometry(oldMapMesh, geometryOptions)
		map.rotateZ(-Math.PI / 2)
		const newMapMesh: Mesh = mapMesh.clone() as Mesh
		newMapMesh.clear()
		newMapMesh.geometry = map
		newMapMesh.name = "Map"
		return newMapMesh
	}

	private createMapGeometry(map: BufferGeometry, geometryOptions: GeometryOptions): BufferGeometry {
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

	private createBaseplateMesh(width: number): Mesh {
		const geometry = this.createBaseplateGeometry(width)
		const material = new MeshBasicMaterial({ color: 0x80_80_80 })
		const baseplateMesh = new Mesh(geometry, material)
		baseplateMesh.name = "Baseplate"
		return baseplateMesh
	}

	private createBaseplateGeometry(width: number): BufferGeometry {
		let edgeRadius = 5 // Adjust this value to change the roundness of the corners
		const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
		if (maxRoundRadius < edgeRadius) {
			edgeRadius = maxRoundRadius
		}

		// Create the shape
		const shape = new Shape()

		shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false)
		shape.absarc(width - edgeRadius, frontTextSize + width - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false)
		shape.absarc(edgeRadius, frontTextSize + width - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false)
		shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false)

		// Create the geometry
		const geometry = new ExtrudeGeometry(shape, { depth: baseplateHeight, bevelEnabled: false })
		geometry.translate(-width / 2, -width / 2 - frontTextSize, -baseplateHeight)

		return geometry
	}

	private createFrontText(frontText: string, width: number): Mesh {
		const textGeometry = new TextGeometry(frontText, {
			font: this.font,
			size: frontTextSize,
			height: frontTextHeight
		})
		textGeometry.center()

		//calculate the bounding box of the text
		textGeometry.computeBoundingBox()
		const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
		textGeometry.translate(0, -textDepth / 2 - (width - mapSideOffset) / 2, logoHeight / 2)

		const material = new MeshBasicMaterial({ color: 0xff_ff_ff })
		const textMesh = new Mesh(textGeometry, material)
		textMesh.name = "FrontText"
		return textMesh
	}

	private async createMetricsMesh(geometryOptions: GeometryOptions): Promise<Mesh> {
		const areaIcon = "area_icon_for_3D_print.svg"
		const areaIconScale = 10
		const areaText =
			`${geometryOptions.areaMetricData.name}\n` +
			`${geometryOptions.areaMetricTitle}\n` +
			`Value range:  ${geometryOptions.areaMetricData.minValue} - ${geometryOptions.areaMetricData.maxValue}`

		const heightIcon = "height_icon_for_3D_print.svg"
		const heightIconScale = 12
		const heightText =
			`${geometryOptions.heightMetricData.name}\n` +
			`${geometryOptions.heightMetricTitle}\n` +
			`Value range: ${geometryOptions.heightMetricData.minValue} - ${geometryOptions.heightMetricData.maxValue}`

		const colorIcon = "color_icon_for_3D_print.svg"
		const colorIconScale = 10
		const colorTextNameAndTitle = `${geometryOptions.colorMetricData.name}\n` + `${geometryOptions.colorMetricTitle}\n`
		const colorTextValueRanges = [
			`Value ranges:`,
			` ${geometryOptions.colorMetricData.minValue} - ${geometryOptions.colorRange.from - 1}`,
			` /`,
			` ${geometryOptions.colorRange.from} - ${geometryOptions.colorRange.to - 1}`,
			` /`,
			` ${geometryOptions.colorRange.to} - ${geometryOptions.colorMetricData.maxValue}`
		]

		const icons = [areaIcon, heightIcon, colorIcon].map(icon => `codeCharta/assets/${icon}`)
		const iconScales = [areaIconScale, heightIconScale, colorIconScale]
		const whiteTexts = [areaText, heightText, colorTextNameAndTitle]

		const backTextGeometries = []
		for (const [index, icon] of icons.entries()) {
			const iconGeometry = await this.createSvgGeometry(icon)
			const iconScale = iconScales[index]

			iconGeometry.center()
			iconGeometry.rotateY(Math.PI)
			iconGeometry.rotateX(Math.PI)
			iconGeometry.scale(iconScale, iconScale, baseplateHeight / 2)

			iconGeometry.translate(geometryOptions.width / 2 - mapSideOffset, -35 * index - 15, -((baseplateHeight * 3) / 4))
			backTextGeometries.push(iconGeometry)

			const text = whiteTexts[index]
			const textGeometry = new TextGeometry(text, {
				font: this.font,
				size: backTextSize,
				height: baseplateHeight / 2
			})
			textGeometry.rotateY(Math.PI)

			textGeometry.translate(geometryOptions.width / 2 - mapSideOffset - 10, -35 * index + backTextSize - 15, -baseplateHeight / 2)

			backTextGeometries.push(textGeometry)
		}

		// Create separate geometries for each part of the colorText and assign different materials to them
		const colorTextGeometries = []
		const colors = [0xff_ff_ff, 0x00_ff_00, 0xff_ff_ff, 0xff_ff_00, 0xff_ff_ff, 0xff_00_00] // white, green, white, yellow, white, red
		let xOffset = geometryOptions.width / 2 - mapSideOffset - 10
		for (let index = 0; index < colorTextValueRanges.length; index += 1) {
			const textGeometry = new TextGeometry(`\n\n${colorTextValueRanges[index]}`, {
				font: this.font,
				size: backTextSize,
				height: baseplateHeight / 2
			})
			textGeometry.rotateY(Math.PI)
			textGeometry.translate(xOffset, -35 * 2 + backTextSize - 15, -baseplateHeight / 2)
			const material = new MeshBasicMaterial({ color: colors[index], side: DoubleSide })
			const textMesh = new Mesh(textGeometry, material)
			textMesh.name = `Metric Text Part ${index}`
			colorTextGeometries.push(textMesh)

			if (index !== colorTextValueRanges.length - 1) {
				textGeometry.computeBoundingBox()
				xOffset = textGeometry.boundingBox.min.x
			}
		}

		const metricTextGeometry = BufferGeometryUtils.mergeBufferGeometries(backTextGeometries)
		const material = new MeshBasicMaterial({ color: 0xff_ff_ff, side: DoubleSide })
		const backTextMesh = new Mesh(metricTextGeometry, material)
		backTextMesh.name = "Metric Text"
		backTextMesh.visible = this.scaleAndCenterBack(backTextMesh, geometryOptions.width)

		for (const colorTextGeometry of colorTextGeometries) {
			backTextMesh.add(colorTextGeometry)
		}
		return backTextMesh
	}

	private scaleAndCenterBack(backTextMesh: Mesh, baseplateWidth: number, scaleFactor = 1): boolean {
		backTextMesh.geometry.computeBoundingBox()
		const boundingBox = backTextMesh.geometry.boundingBox
		const width = boundingBox.max.x - boundingBox.min.x
		const depth = boundingBox.max.y - boundingBox.min.y

		const minPossibleMaxScale = Math.min(
			(baseplateWidth - mapSideOffset * 2) / width,
			(baseplateWidth - mapSideOffset * 2 + frontTextSize) / depth
		)

		backTextMesh.scale.set(backTextMesh.scale.x * scaleFactor, backTextMesh.scale.y * scaleFactor, backTextMesh.scale.z)
		return minPossibleMaxScale >= 0.75
	}

	private async createCodeChartaMesh(geometryOptions: GeometryOptions) {
		const logoGeometry = await this.createCodeChartaLogo()
		const textGeometry = this.createCodeChartaText()
		const logoAndTextGeometry = BufferGeometryUtils.mergeBufferGeometries([logoGeometry, textGeometry])

		const material = new MeshBasicMaterial({ color: 0xff_ff_ff })

		const codeChartaMesh = new Mesh(logoAndTextGeometry, material)
		codeChartaMesh.name = "CodeCharta Logo"
		this.scaleAndCenterBack(codeChartaMesh, geometryOptions.width)
		return codeChartaMesh
	}

	private async createCodeChartaLogo() {
		const logoGeometry = await this.createSvgGeometry("codeCharta/assets/codecharta_logo.svg")
		logoGeometry.center()
		logoGeometry.rotateZ(Math.PI)

		const logoScale = 20
		logoGeometry.scale(logoScale, logoScale, baseplateHeight / 2)
		logoGeometry.translate(0, 30, -((baseplateHeight * 3) / 4))

		return logoGeometry
	}

	private createCodeChartaText() {
		const textGeometry = new TextGeometry("github.com/MaibornWolff/codecharta", {
			font: this.font,
			size: backTextSize,
			height: baseplateHeight / 2
		})
		textGeometry.center()
		textGeometry.rotateY(Math.PI)

		textGeometry.translate(0, 15, -((baseplateHeight * 3) / 4))

		return textGeometry
	}

	private async createBackMW(geometryOptions: GeometryOptions): Promise<Mesh> {
		const mwLogoGeometry = await this.createSvgGeometry("codeCharta/assets/mw_logo_text.svg")
		mwLogoGeometry.center()
		mwLogoGeometry.rotateZ(Math.PI)
		const mwBackLogoScale = 60
		mwLogoGeometry.scale(mwBackLogoScale, mwBackLogoScale, baseplateHeight / 2)
		mwLogoGeometry.translate(0, geometryOptions.width / 2 - mwBackLogoScale / 2, -((baseplateHeight * 3) / 4))

		const material = new MeshBasicMaterial({ color: 0xff_ff_ff })

		const backMWMesh = new Mesh(mwLogoGeometry, material)
		backMWMesh.name = "Back MW Logo"
		return backMWMesh
	}

	private async createFrontMWLogo(geometryOptions: GeometryOptions): Promise<Mesh> {
		const filePath = `codeCharta/assets/mw_logo.svg`

		const mwLogoMesh = await this.createSvgMesh(filePath, logoHeight, logoSize)

		mwLogoMesh.geometry.computeBoundingBox()
		const boundingBox = mwLogoMesh.geometry.boundingBox
		const logoWidth = boundingBox.max.x - boundingBox.min.x
		const logoDepth = boundingBox.max.y - boundingBox.min.y
		mwLogoMesh.position.set(
			geometryOptions.width / 2 - logoWidth - mapSideOffset,
			-logoDepth / 2 - (geometryOptions.width - mapSideOffset) / 2,
			logoHeight / 2
		)

		mwLogoMesh.name = "Front MW Logo"
		return mwLogoMesh
	}

	private async createSvgMesh(filePath: string, height: number, size: number): Promise<Mesh> {
		const svgGeometry = await this.createSvgGeometry(filePath)
		svgGeometry.center()
		svgGeometry.rotateZ(Math.PI)
		svgGeometry.rotateY(Math.PI)
		svgGeometry.scale(size, size, height)

		const material = new MeshBasicMaterial({ color: 0xff_ff_ff, side: DoubleSide })
		const svgMesh = new Mesh(svgGeometry, material)
		svgMesh.name = "Unnamed SVG Mesh"
		return svgMesh
	}

	private async createSvgGeometry(filePath: string): Promise<BufferGeometry> {
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
}
