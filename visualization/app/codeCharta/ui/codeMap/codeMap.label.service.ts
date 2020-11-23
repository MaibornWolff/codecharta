import { Sprite, Vector3, Box3, Sphere, LineBasicMaterial, Line, Geometry, LinearFilter, Texture, SpriteMaterial, CanvasTexture, MeshBasicMaterial, PlaneGeometry, Mesh } from "three"
import { Node } from "../../codeCharta.model"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ColorConverter } from "../../util/color/colorConverter"

interface InternalLabel {
	sprite: Sprite
	line: Line | null
	heightValue: number
	lineCount: number
}

export class CodeMapLabelService implements CameraChangeSubscriber {
	private labels: InternalLabel[]
	private mapLabelColors = this.storeService.getState().appSettings.mapColors.labelColorAndAlpha
	private LABEL_COLOR_RGB = ColorConverter.convertHexToRgba(this.mapLabelColors.rgb)
	private LABEL_COLOR_RGBA = ColorConverter.convertHexToRgba(this.mapLabelColors.rgb, this.mapLabelColors.alpha)
	private LABEL_WIDTH_DIVISOR = 2100 // empirically gathered
	private LABEL_HEIGHT_DIVISOR = 35 // empirically gathered
	private LABEL_CORNER_RADIUS = 40 //empirically gathered

	private currentScale: Vector3 = new Vector3(1, 1, 1)
	private resetScale = false
	private lineCount = 1

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService
	) {
		this.labels = new Array<InternalLabel>()
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	addLabel(node: Node, options: { showNodeName: boolean; showNodeMetric: boolean }) { // todo: tk rename to addLeafLabel
		const state = this.storeService.getState()
		if (node.attributes?.[state.dynamicSettings.heightMetric]) {
			const x = node.x0 - state.treeMap.mapSize
			const y = node.z0
			const z = node.y0 - state.treeMap.mapSize

			const labelX = x + node.width / 2
			const labelY = y + node.height
			const labelZ = z + node.length / 2

			let labelText = ""

			if (options.showNodeName) {
				labelText = `${node.name}`
			}
			if (options.showNodeMetric) {
				if (labelText !== "") {
					labelText += "\n"
				}
				labelText += `${node.attributes[state.dynamicSettings.heightMetric]} ${state.dynamicSettings.heightMetric}`
			}

			const label = this.makeText(labelText, 30)

			label.sprite.position.set(labelX, labelY + 60 + label.heightValue / 2, labelZ)
			label.line = this.makeLine(labelX, labelY, labelZ)

			this.threeSceneService.labels.add(label.sprite)
			this.threeSceneService.labels.add(label.line)

			this.labels.push(label) // todo tk: why is the duplication of this.labels and threeSceneService.labels needed? To sync label.sprite with label.line I guess - is there maybe a nicer solution for that?
		}
		this.resetScale = true
	}

	addPackageLabel(packageNode: Node) {
		console.log(packageNode)
		const canvas = document.createElement("canvas")
		canvas.width = packageNode.width
		canvas.height = packageNode.height + 200
		const context = canvas.getContext("2d")

		context.font = `100px Helvetica Neue`
		// canvas.style = "background: transparent"
		context.fillStyle = packageNode.name === "root" ? "red" :"blue" //"rgba(0, 0, 0, 0)"
		context.fillRect(0, 0, canvas.width, canvas.height)
		context.fillStyle = "white"
		// context.textAlign = "center"
		context.textBaseline = "middle"
		context.fillText("hello worlddddddddddddddddddddddddddddddddddddddddddddd", 0, 0)

		const texture = new CanvasTexture(canvas)

		const material = new MeshBasicMaterial({ map : texture });
		material.transparent = true;

		const mesh = new Mesh(new PlaneGeometry(canvas.width, canvas.height, 10, 10), material);
		mesh.position.x = packageNode.x0
		mesh.position.y = packageNode.z0
		mesh.position.z = packageNode.y0;
		// mesh.scale.set(packageNode.width, packageNode.height, 1)
		// mesh.scale.set(50, 25, 1)

		// this.threeSceneService.labels := three.js group which gets rendered
		this.threeSceneService.labels.add(mesh);
	
		// this.labels.add ? check why that needed in addLabel()
	} 

	clearLabels() {
		this.labels = []
		// Reset the children
		this.threeSceneService.labels.children.length = 0
	}

	scale() {
		const { scaling } = this.storeService.getState().appSettings
		if (this.resetScale) {
			this.resetScale = false
			this.currentScale = new Vector3(1, 1, 1)
		}

		for (const label of this.labels) {
			const labelHeightDifference = new Vector3(0, 60, 0)
			label.sprite.position
				.sub(labelHeightDifference.clone())
				.divide(this.currentScale.clone())
				.multiply(scaling.clone())
				.add(labelHeightDifference.clone())

			// Attribute vertices does exist on geometry but it is missing in the mapping file for TypeScript.
			label.line.geometry["vertices"][0].divide(this.currentScale.clone()).multiply(scaling.clone())
			label.line.geometry["vertices"][1].copy(label.sprite.position)
			label.line.geometry.translate(0, 0, 0)
		}
		this.currentScale.copy(scaling)
	}

	onCameraChanged() {
		for (const label of this.labels) {
			this.setLabelSize(label.sprite, label.sprite.material.map.image.width, label)
		}
	}

	private makeText(message: string, fontsize: number): InternalLabel {
		const canvas = document.createElement("canvas")
		const context = canvas.getContext("2d")

		context.font = `${fontsize}px Helvetica Neue`

		const margin = 20
		const multiLineContext = message.split("\n")

		// setting canvas width/height before ctx draw, else canvas is empty
		const firstMultiLineContextWidth = context.measureText(multiLineContext[0]).width
		const secondMultiLineContextWidth = context.measureText(multiLineContext[1]).width
		canvas.width =
			firstMultiLineContextWidth > secondMultiLineContextWidth
				? firstMultiLineContextWidth + margin
				: secondMultiLineContextWidth + margin
		canvas.height = margin + fontsize * multiLineContext.length

		// bg
		context.font = `${fontsize}px Helvetica Neue`
		context.fillStyle = this.LABEL_COLOR_RGBA
		context.lineJoin = "round"
		context.lineCap = "round"
		context.lineWidth = 5

		this.drawRectangleWithRoundedCorners(context, 0, 0, canvas.width, canvas.height, this.LABEL_CORNER_RADIUS)

		// after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
		context.fillStyle = "rgba(0,0,0,1)"
		context.textAlign = "center"
		context.textBaseline = "middle"

		//fillText() cannot create multi-line texts, we call it multiple times with different offsets to create a multi-line label
		for (const [index, element] of multiLineContext.entries()) {
			context.fillText(element, canvas.width / 2, (canvas.height * (index + 1)) / (multiLineContext.length + 1))
		}

		const texture = new Texture(canvas)
		texture.minFilter = LinearFilter // NearestFilter;
		texture.needsUpdate = true

		const spriteMaterial = new SpriteMaterial({ map: texture })
		const sprite = new Sprite(spriteMaterial)
		this.lineCount = multiLineContext.length
		this.setLabelSize(sprite, canvas.width, null)

		return {
			sprite,
			heightValue: canvas.height,
			line: null,
			lineCount: multiLineContext.length
		}
	}

	private drawRectangleWithRoundedCorners(context, x, y, width, height, radius) {
		if (width < 2 * radius) radius = width / 2
		if (height < 2 * radius) radius = height / 2
		context.beginPath()

		context.moveTo(x + radius, y)
		context.arcTo(x + width, y, x + width, y + height, radius)
		context.arcTo(x + width, y + height, x, y + height, radius)
		context.arcTo(x, y + height, x, y, radius)
		context.arcTo(x, y, x + width, y, radius)

		context.closePath()
		context.fill()
	}

	private setLabelSize(sprite: Sprite, labelWidth: number = sprite.material.map.image.width, label: InternalLabel) {
		const mapCenter = new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere(new Sphere()).center
		const distance = this.threeCameraService.camera.position.distanceTo(mapCenter)
		if (label !== null) {
			this.lineCount = label.lineCount
		}
		if (this.lineCount > 1) {
			sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * labelWidth, distance / 25, 1)
		} else {
			sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * labelWidth, distance / this.LABEL_HEIGHT_DIVISOR, 1)
		}
	}

	private makeLine(x: number, y: number, z: number) {
		const material = new LineBasicMaterial({
			color: this.LABEL_COLOR_RGB,
			linewidth: 2
		})

		const geometry = new Geometry()
		geometry.vertices.push(new Vector3(x, y, z), new Vector3(x, y + 60, z))

		return new Line(geometry, material)
	}
}
