import {
	Box3,
	BufferGeometry,
	ExtrudeGeometry,
	Float32BufferAttribute,
	Font,
	FontLoader,
	Mesh,
	MeshBasicMaterial,
	ShaderMaterial,
	Shape,
	TextGeometry,
	Vector3
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
	mapMesh: Mesh
	wantedWidth: number
	areaMetricTitle: string
	areaMetricData: NodeMetricData
	heightMetricTitle: string
	heightMetricData: NodeMetricData
	colorMetricTitle: string
	colorMetricData: NodeMetricData
	colorRange: ColorRange
	frontText?: string
	defaultMaterial: ShaderMaterial
	numberOfColors: number
}

export class Preview3DPrintMesh {
	private font: Font
	private geometryOptions: GeometryOptions
	private printMesh: Mesh
	private currentSize: Vector3

	async initialize(geometryOptions: GeometryOptions) {
		this.printMesh = new Mesh()
		this.printMesh.name = "PrintMesh"

		this.geometryOptions = geometryOptions

		await this.loadFont()
		await this.createPrintPreviewMesh()
		this.updateCurrentSize()
	}

	getThreeMesh(): Mesh {
		return this.printMesh
	}

	getSize(): Vector3 {
		return this.currentSize
	}

	async createPrintPreviewMesh() {
		const baseplateMesh = this.createBaseplateMesh()
		this.printMesh.add(baseplateMesh)

		const newMapMesh = this.createMapMesh()
		this.printMesh.add(newMapMesh)

		if (this.geometryOptions.frontText) {
			try {
				const frontTextMesh = this.createFrontText()
				this.printMesh.attach(frontTextMesh)
			} catch (error) {
				console.error("Error creating text:", error)
			}
		}

		const mwLogo = await this.createFrontMWLogo()
		this.printMesh.add(mwLogo)

		const metricsMesh = await this.createMetricsMesh()
		this.printMesh.add(metricsMesh)

		const codeChartaMesh = await this.createCodeChartaMesh()
		this.printMesh.add(codeChartaMesh)

		const backMWMesh = await this.createBackMW()
		this.printMesh.add(backMWMesh)
	}

	updateMapSize(wantedWidth: number) {
		this.geometryOptions.wantedWidth = wantedWidth
		const currentWidth = this.currentSize.x

		for (const object of this.printMesh.children) {
			const child = object as Mesh
			switch (child.name) {
				case "Map": {
					const map = child.geometry
					const scale = (wantedWidth - 2 * mapSideOffset) / (currentWidth - 2 * mapSideOffset)
					map.scale(scale, scale, scale)
					break
				}
				case "Baseplate":
					child.geometry = this.createBaseplateGeometry()
					break

				case "Front Text": {
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
					this.updateCustomLogoPosition(child)
					break

				case "Metric Text":
					child.visible = this.scaleBacktext(child, wantedWidth / currentWidth)
					if (child.visible) {
						this.xCenterMetricsMesh(child)
					}
					break

				case "CodeCharta Logo":
					child.visible = this.scaleBacktext(child, wantedWidth / currentWidth)
					break

				case "Back MW Logo":
					child.visible = this.scaleBacktext(child, wantedWidth / currentWidth)
					break

				default:
					console.warn("Unknown object:", child.name, "Did you forget to add it to the updateMapSize method?")
					break
			}
		}

		this.updateCurrentSize()
	}

	updateNumberOfColors(mapWithOriginalColors: Mesh, newNumberOfColors: number) {
		this.geometryOptions.numberOfColors = newNumberOfColors
		this.updateMapColors(mapWithOriginalColors.geometry, (this.printMesh.getObjectByName("Map") as Mesh).geometry)
		this.printMesh.traverse(child => {
			if (child.name !== "Map" && child.name !== "PrintMesh") {
				this.updateColor(child as Mesh)
			}
		})
	}

	async addCustomLogo(dataUrl: string): Promise<void> {
		const customLogoMesh = await this.createSvgMesh(dataUrl, logoHeight, logoSize)

		this.updateCustomLogoPosition(customLogoMesh)
		customLogoMesh.name = "Custom Logo"

		this.printMesh.attach(customLogoMesh)
	}

	rotateCustomLogo() {
		const logoMesh = this.printMesh.getObjectByName("Custom Logo") as Mesh
		if (logoMesh) {
			logoMesh.rotateZ(Math.PI / 2) // Rotate 90 degrees
		}
	}

	flipCustomLogo() {
		const logoMesh = this.printMesh.getObjectByName("Custom Logo") as Mesh
		if (logoMesh) {
			logoMesh.rotateY(Math.PI) // Rotate 180 degrees
		}
	}

	updateCustomLogoColor(newColor: string) {
		const logoMesh = this.printMesh.getObjectByName("Custom Logo") as Mesh
		if (logoMesh) {
			;(logoMesh.material as MeshBasicMaterial).color.set(newColor)
		}
	}

	updateFrontText(newFrontText: string) {
		this.geometryOptions.frontText = newFrontText
		this.printMesh.remove(this.printMesh.getObjectByName("Front Text"))
		const text = this.createFrontText()
		this.printMesh.attach(text)
	}

	private async loadFont() {
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

	private updateCurrentSize() {
		const baseplate = this.printMesh.getObjectByName("Baseplate") as Mesh
		baseplate.geometry.computeBoundingBox()
		const boundingBoxBaseplate = baseplate.geometry.boundingBox

		const map = this.printMesh.getObjectByName("Map") as Mesh
		map.geometry.computeBoundingBox()
		const boundingBoxMap = map.geometry.boundingBox

		const currentWidth = boundingBoxBaseplate.max.x - boundingBoxBaseplate.min.x
		const currentDepth = boundingBoxBaseplate.max.y - boundingBoxBaseplate.min.y
		const currentHeight = boundingBoxBaseplate.max.z - boundingBoxBaseplate.min.z + boundingBoxMap.max.z - boundingBoxMap.min.z
		this.currentSize = new Vector3(currentWidth, currentDepth, currentHeight)
	}

	private updateCustomLogoPosition(customLogoMesh: Mesh) {
		customLogoMesh.geometry.computeBoundingBox()
		const boundingBox = customLogoMesh.geometry.boundingBox
		const logoWidth = boundingBox.max.x - boundingBox.min.x
		const logoDepth = boundingBox.max.y - boundingBox.min.y
		customLogoMesh.position.set(
			-this.geometryOptions.wantedWidth / 2 + logoWidth + mapSideOffset,
			-logoDepth / 2 - (this.geometryOptions.wantedWidth - mapSideOffset) / 2,
			logoHeight / 2
		)
	}

	private createMapMesh(): Mesh {
		const newMapGeometry = this.geometryOptions.mapMesh.geometry.clone()
		newMapGeometry.rotateX(Math.PI / 2)
		this.updateMapGeometry(newMapGeometry)
		newMapGeometry.rotateZ(-Math.PI / 2)
		const newMapMesh: Mesh = this.geometryOptions.mapMesh.clone() as Mesh
		newMapMesh.clear()
		newMapMesh.geometry = newMapGeometry
		newMapMesh.name = "Map"
		return newMapMesh
	}

	private updateMapGeometry(map: BufferGeometry): BufferGeometry {
		const width = this.geometryOptions.wantedWidth - 2 * mapSideOffset

		const normalizeFactor = map.boundingBox.max.x
		const scale = width / normalizeFactor
		map.scale(scale, scale, scale)

		map.translate(-width / 2, width / 2, 0)

		this.updateMapColors(map, map)

		return map
	}

	private updateMapColors(mapWithOriginalColors: BufferGeometry, previewMap: BufferGeometry) {
		const newColors = []

		for (let index = 0; index < mapWithOriginalColors.attributes.color.count; index++) {
			const colorR = mapWithOriginalColors.attributes.color.getX(index)
			const colorG = mapWithOriginalColors.attributes.color.getY(index)
			const colorB = mapWithOriginalColors.attributes.color.getZ(index)
			let newColor: number[]

			if (colorR === colorB && colorR === colorG && colorG === colorB) {
				//all grey values
				newColor = this.getColorArray("Area")
			} else if (colorR > 0.75 && colorG > 0.75) {
				//yellow
				newColor = this.getColorArray("Neutral Building")
			} else if (colorR > 0.45 && colorG < 0.1) {
				//red
				newColor = this.getColorArray("Negative Building")
			} else if (colorR < 5 && colorG > 0.6) {
				//green
				newColor = this.getColorArray("Positive Building")
			} else {
				console.error("Unknown color")
				newColor = [1, 1, 1]
			}
			newColors.push(...newColor)
		}
		previewMap.setAttribute("color", new Float32BufferAttribute(newColors, 3))
	}

	private updateColor(mesh: Mesh) {
		if (mesh.material instanceof MeshBasicMaterial) {
			const colorArray = this.getColorArray(mesh.name)
			;(mesh.material as MeshBasicMaterial).color.setRGB(colorArray[0], colorArray[1], colorArray[2])
		} else if (mesh.material instanceof ShaderMaterial) {
			;(mesh.material as ShaderMaterial).defaultAttributeValues.color = this.getColorArray(mesh.name)
		}
	}

	private getColorArray(partName: string): number[] {
		const numberOfColors = this.geometryOptions.numberOfColors

		const getBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [0, 1, 0])
		const getNeutralBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [1, 1, 0])
		const getNegativeBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [1, 0, 0])
		const getBaseplateColor = () => {
			if (numberOfColors === 1) {
				return [1, 1, 1]
			}
			return [0.5, 0.5, 0.5]
		}
		const getFrontTextAndLogoColor = () => {
			if (numberOfColors < 4) {
				return [1, 1, 1]
			}
			if (numberOfColors === 4) {
				return [1, 1, 0]
			}
			return [1, 1, 1]
		}
		const getBackTextAndLogoColor = () => {
			if (numberOfColors === 1) {
				return [0, 0, 1]
			}
			if (numberOfColors < 4) {
				return [1, 1, 1]
			}
			if (numberOfColors === 4) {
				return [1, 1, 0]
			}
			return [1, 1, 1]
		}
		const getMetricColorTextColor = (colorWhenMoreThan3: number[]) => {
			if (numberOfColors < 4) {
				return [0, 0, 1]
			}
			return colorWhenMoreThan3
		}

		const colorFunctions = {
			"Positive Building": getBuildingColor,
			"Neutral Building": getNeutralBuildingColor,
			"Negative Building": getNegativeBuildingColor,
			Baseplate: getBaseplateColor,
			Area: getBaseplateColor,
			"Front MW Logo": getFrontTextAndLogoColor,
			"Front Text": getFrontTextAndLogoColor,
			"CodeCharta Logo": getBackTextAndLogoColor,
			"Back MW Logo": getBackTextAndLogoColor,
			"Metric Text": getBackTextAndLogoColor,
			"Metric Text Part 0": getBackTextAndLogoColor,
			"Metric Text Part 1": () => getMetricColorTextColor([0, 1, 0]),
			"Metric Text Part 2": getBackTextAndLogoColor,
			"Metric Text Part 3": () => getMetricColorTextColor([1, 1, 0]),
			"Metric Text Part 4": getBackTextAndLogoColor,
			"Metric Text Part 5": () => getMetricColorTextColor([1, 0, 0])
		}

		if (partName in colorFunctions) {
			return colorFunctions[partName]()
		}
		console.error("Unknown part name:", partName)
		return [0, 1, 1]
	}

	private createBaseplateMesh(): Mesh {
		const geometry = this.createBaseplateGeometry()
		//at the moment we use a workaround, so we don't need to calculate color, delta, deltaColor and isHeight
		//the downside of this workaround is that there can only be one default color for all objects
		//if its needed that all objects have ShaderMaterial have a look at geometryGenerator.ts
		const shaderMaterial = new ShaderMaterial()
		shaderMaterial.copy(this.geometryOptions.defaultMaterial)
		shaderMaterial.polygonOffset = true
		shaderMaterial.polygonOffsetUnits = 1
		shaderMaterial.polygonOffsetFactor = 0.1
		const baseplateMesh = new Mesh(geometry, shaderMaterial)
		baseplateMesh.name = "Baseplate"
		this.updateColor(baseplateMesh)
		return baseplateMesh
	}

	private createBaseplateGeometry(): BufferGeometry {
		let edgeRadius = 5 // Adjust this value to change the roundness of the corners
		const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
		if (maxRoundRadius < edgeRadius) {
			edgeRadius = maxRoundRadius
		}

		// Create the shape
		const shape = new Shape()
		const width = this.geometryOptions.wantedWidth
		const depth = this.geometryOptions.wantedWidth + frontTextSize

		shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false)
		shape.absarc(width - edgeRadius, depth - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false)
		shape.absarc(edgeRadius, depth - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false)
		shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false)

		// Create the geometry
		const geometry = new ExtrudeGeometry(shape, { depth: baseplateHeight, bevelEnabled: false })
		geometry.translate(-width / 2, -width / 2 - frontTextSize, -baseplateHeight)

		return geometry
	}

	private createFrontText(): Mesh {
		const textGeometry = new TextGeometry(this.geometryOptions.frontText, {
			font: this.font,
			size: frontTextSize,
			height: frontTextHeight
		})
		textGeometry.center()

		//calculate the bounding box of the text
		textGeometry.computeBoundingBox()
		const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
		textGeometry.translate(0, -textDepth / 2 - (this.geometryOptions.wantedWidth - mapSideOffset) / 2, logoHeight / 2)

		const material = new MeshBasicMaterial()
		const textMesh = new Mesh(textGeometry, material)
		textMesh.name = "Front Text"
		this.updateColor(textMesh)
		return textMesh
	}

	private async createMetricsMesh(): Promise<Mesh> {
		const { areaIcon, areaIconScale, areaText } = this.createAreaAttributes()
		const { heightIcon, heightIconScale, heightText } = this.createHeightAttributes()
		const { colorIcon, colorIconScale, colorTextNameAndTitle, colorTextValueRanges } = this.createColorAttributes()

		const icons = [areaIcon, heightIcon, colorIcon].map(icon => `codeCharta/assets/${icon}`)
		const iconScales = [areaIconScale, heightIconScale, colorIconScale]
		const whiteTexts = [areaText, heightText, colorTextNameAndTitle]

		const whiteBackGeometries = await this.createWhiteBackGeometries(icons, iconScales, whiteTexts)
		const mergedWhiteBackGeometry = BufferGeometryUtils.mergeBufferGeometries(whiteBackGeometries)

		const material = new MeshBasicMaterial()
		const metricsMesh = new Mesh(mergedWhiteBackGeometry, material)

		const coloredBackTextGeometries = this.createColoredBackTextGeometries(colorTextValueRanges)
		for (const colorTextGeometry of coloredBackTextGeometries) {
			metricsMesh.add(colorTextGeometry)
		}
		metricsMesh.name = "Metric Text"
		this.updateColor(metricsMesh)
		const scaleFactor = (this.geometryOptions.wantedWidth - mapSideOffset * 2) / 200
		metricsMesh.visible = this.scaleBacktext(metricsMesh, scaleFactor)
		if (metricsMesh.visible) {
			this.xCenterMetricsMesh(metricsMesh)
		}
		return metricsMesh
	}

	private xCenterMetricsMesh(metricsMesh: Mesh) {
		//compute bounding box of the mesh and center it in the x direction
		let boundingBox = new Box3()
		metricsMesh.traverse(child => {
			if (child instanceof Mesh) {
				child.geometry.computeBoundingBox()
				boundingBox = boundingBox.union(child.geometry.boundingBox)
			}
		})
		metricsMesh.position.x = (Math.abs(boundingBox.max.x - boundingBox.min.x) * metricsMesh.scale.x) / 2
	}

	private createColoredBackTextGeometries(colorTextValueRanges: string[]) {
		const colorTextGeometries = []
		let xOffset = -10
		for (let index = 0; index < colorTextValueRanges.length; index += 1) {
			const textGeometry = new TextGeometry(`\n\n${colorTextValueRanges[index]}`, {
				font: this.font,
				size: backTextSize,
				height: baseplateHeight / 2
			})
			textGeometry.rotateY(Math.PI)
			textGeometry.translate(xOffset, -35 * 2 + backTextSize - 15, -baseplateHeight / 2)
			const material = new MeshBasicMaterial()
			const textMesh = new Mesh(textGeometry, material)
			textMesh.name = `Metric Text Part ${index}`
			this.updateColor(textMesh)
			colorTextGeometries.push(textMesh)

			if (index !== colorTextValueRanges.length - 1) {
				textGeometry.computeBoundingBox()
				xOffset = textGeometry.boundingBox.min.x
			}
		}
		return colorTextGeometries
	}

	private async createWhiteBackGeometries(icons: string[], iconScales: number[], whiteTexts: string[]) {
		const backGeometries = []
		for (const [index, icon] of icons.entries()) {
			const iconGeometry = await this.createSvgGeometry(icon)
			const iconScale = iconScales[index]

			iconGeometry.center()
			iconGeometry.rotateY(Math.PI)
			iconGeometry.rotateX(Math.PI)
			iconGeometry.scale(iconScale, iconScale, baseplateHeight / 2)

			iconGeometry.translate(0, -35 * index - 15, -((baseplateHeight * 3) / 4))
			backGeometries.push(iconGeometry)

			const text = whiteTexts[index]
			const textGeometry = new TextGeometry(text, {
				font: this.font,
				size: backTextSize,
				height: baseplateHeight / 2
			})
			textGeometry.rotateY(Math.PI)

			textGeometry.translate(-10, -35 * index + backTextSize - 15, -baseplateHeight / 2)

			backGeometries.push(textGeometry)
		}
		return backGeometries
	}

	private createColorAttributes() {
		const colorIcon = "color_icon_for_3D_print.svg"
		const colorIconScale = 10
		const colorTextNameAndTitle = `${this.geometryOptions.colorMetricData.name}\n` + `${this.geometryOptions.colorMetricTitle}\n`
		const colorTextValueRanges = [
			`Value ranges:`,
			` ${this.geometryOptions.colorMetricData.minValue} - ${this.geometryOptions.colorRange.from - 1}`,
			` /`,
			` ${this.geometryOptions.colorRange.from} - ${this.geometryOptions.colorRange.to - 1}`,
			` /`,
			` ${this.geometryOptions.colorRange.to} - ${this.geometryOptions.colorMetricData.maxValue}`
		]
		return { colorIcon, colorIconScale, colorTextNameAndTitle, colorTextValueRanges }
	}

	private createHeightAttributes() {
		const heightIcon = "height_icon_for_3D_print.svg"
		const heightIconScale = 12
		const heightText =
			`${this.geometryOptions.heightMetricData.name}\n` +
			`${this.geometryOptions.heightMetricTitle}\n` +
			`Value range: ${this.geometryOptions.heightMetricData.minValue} - ${this.geometryOptions.heightMetricData.maxValue}`
		return { heightIcon, heightIconScale, heightText }
	}

	private createAreaAttributes() {
		const areaIcon = "area_icon_for_3D_print.svg"
		const areaIconScale = 10
		const areaText =
			`${this.geometryOptions.areaMetricData.name}\n` +
			`${this.geometryOptions.areaMetricTitle}\n` +
			`Value range:  ${this.geometryOptions.areaMetricData.minValue} - ${this.geometryOptions.areaMetricData.maxValue}`
		return { areaIcon, areaIconScale, areaText }
	}

	private scaleBacktext(backTextMesh: Mesh, scaleFactor): boolean {
		backTextMesh.scale.set(backTextMesh.scale.x * scaleFactor, backTextMesh.scale.y * scaleFactor, backTextMesh.scale.z)

		backTextMesh.geometry.computeBoundingBox()
		const boundingBox = backTextMesh.geometry.boundingBox
		const width = boundingBox.max.x - boundingBox.min.x
		const depth = boundingBox.max.y - boundingBox.min.y

		const minPossibleMaxScale = Math.min(
			(this.geometryOptions.wantedWidth - mapSideOffset * 2) / width,
			(this.geometryOptions.wantedWidth - mapSideOffset * 2 + frontTextSize) / depth
		)

		return minPossibleMaxScale >= 0.75
	}

	private async createCodeChartaMesh() {
		const logoGeometry = await this.createCodeChartaLogo()
		const textGeometry = this.createCodeChartaText()
		const logoAndTextGeometry = BufferGeometryUtils.mergeBufferGeometries([logoGeometry, textGeometry])

		const material = new MeshBasicMaterial()

		const codeChartaMesh = new Mesh(logoAndTextGeometry, material)
		codeChartaMesh.name = "CodeCharta Logo"
		this.updateColor(codeChartaMesh)
		const scaleFactor = (this.geometryOptions.wantedWidth - mapSideOffset * 2) / 200
		this.scaleBacktext(codeChartaMesh, scaleFactor)
		return codeChartaMesh
	}

	private async createCodeChartaLogo() {
		const logoGeometry = await this.createSvgGeometry("codeCharta/assets/codecharta_logo.svg")
		logoGeometry.center()
		logoGeometry.rotateZ(Math.PI)

		const logoScale = 25
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

	private async createBackMW(): Promise<Mesh> {
		const mwLogoGeometry = await this.createSvgGeometry("codeCharta/assets/mw_logo_text.svg")
		mwLogoGeometry.center()
		mwLogoGeometry.rotateZ(Math.PI)
		const mwBackLogoScale = (3 * (this.geometryOptions.wantedWidth - mapSideOffset * 2)) / 10
		mwLogoGeometry.scale(mwBackLogoScale, mwBackLogoScale, baseplateHeight / 2)
		mwLogoGeometry.translate(0, this.geometryOptions.wantedWidth / 2 - mwBackLogoScale / 2, -((baseplateHeight * 3) / 4))

		const material = new MeshBasicMaterial()

		const backMWMesh = new Mesh(mwLogoGeometry, material)
		backMWMesh.name = "Back MW Logo"

		this.updateColor(backMWMesh)

		return backMWMesh
	}

	private async createFrontMWLogo(): Promise<Mesh> {
		const filePath = `codeCharta/assets/mw_logo.svg`

		const mwLogoMesh = await this.createSvgMesh(filePath, logoHeight, logoSize)

		mwLogoMesh.geometry.computeBoundingBox()
		const boundingBox = mwLogoMesh.geometry.boundingBox
		const logoWidth = boundingBox.max.x - boundingBox.min.x
		const logoDepth = boundingBox.max.y - boundingBox.min.y
		mwLogoMesh.position.set(
			this.geometryOptions.wantedWidth / 2 - logoWidth - mapSideOffset,
			-logoDepth / 2 - (this.geometryOptions.wantedWidth - mapSideOffset) / 2,
			logoHeight / 2
		)

		mwLogoMesh.name = "Front MW Logo"
		this.updateColor(mwLogoMesh)
		return mwLogoMesh
	}

	private async createSvgMesh(filePath: string, height: number, size: number): Promise<Mesh> {
		const svgGeometry = await this.createSvgGeometry(filePath)
		svgGeometry.center()
		svgGeometry.rotateZ(Math.PI)
		svgGeometry.rotateY(Math.PI)
		svgGeometry.scale(size, size, height)

		const material = new MeshBasicMaterial()
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
						const shapes = path.toShapes(false, true)

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

export function calculateMaxPossibleWidthForPreview3DPrintMesh(maxSize: Vector3, mapMesh: Mesh): number {
	const printerWidth = maxSize.x
	const printerDepth = maxSize.y
	const printerHeight = maxSize.z

	const widthFromWidth = printerWidth
	const widthFromDepth = printerDepth - frontTextSize
	const mapCurrentHeight = mapMesh.geometry.boundingBox.max.z - mapMesh.geometry.boundingBox.min.z
	const widthFromHeight = ((printerHeight - baseplateHeight) * mapMesh.geometry.boundingBox.max.x) / mapCurrentHeight + 2 * mapSideOffset

	return Math.min(widthFromWidth, widthFromDepth, widthFromHeight)
}
