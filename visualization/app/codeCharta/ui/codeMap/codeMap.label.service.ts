import { Sprite, Vector3, Box3, Sphere, LineBasicMaterial, Line, Geometry, LinearFilter, Texture, SpriteMaterial } from "three"
import { Node } from "../../codeCharta.model"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"

interface InternalLabel {
	sprite: Sprite
	line: Line | null
	heightValue: number
	lineCount: number
}

export class CodeMapLabelService implements CameraChangeSubscriber {
	private labels: InternalLabel[]
	private LABEL_WIDTH_DIVISOR = 2100 // empirically gathered
	private LABEL_HEIGHT_DIVISOR = 35 // empirically gathered
	private LABEL_CORNER_RADIUS = 35 //empirically gathered

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

	addLabel(node: Node, showNodeName: boolean, showMetricNameValue: boolean) {
		const state = this.storeService.getState()
		if (node.attributes?.[state.dynamicSettings.heightMetric]) {
			const x = node.x0 - state.treeMap.mapSize
			const y = node.z0
			const z = node.y0 - state.treeMap.mapSize

			const labelX = x + node.width / 2
			const labelY = y + node.height
			const labelZ = z + node.length / 2

			let labelText = ""

			if (showNodeName) {
				labelText = `${node.name}`
			}
			if (showMetricNameValue) {
				if (labelText === "") {
					labelText = `${node.attributes[state.dynamicSettings.heightMetric]} ${state.dynamicSettings.heightMetric}`
				} else {
					labelText += `\n${node.attributes[state.dynamicSettings.heightMetric]} ${state.dynamicSettings.heightMetric}`
				}
			}

			const label = this.makeText(labelText, 30)

			label.sprite.position.set(labelX, labelY + 60 + label.heightValue / 2, labelZ)
			label.line = this.makeLine(labelX, labelY, labelZ)

			this.threeSceneService.labels.add(label.sprite)
			this.threeSceneService.labels.add(label.line)

			this.labels.push(label)
		}
		this.resetScale = true
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
		canvas.width = context.measureText(message).width + margin
		canvas.height = margin + fontsize * multiLineContext.length

		// bg
		context.font = `${fontsize}px Helvetica Neue`
		context.fillStyle = "rgba(224,224,224,0.85)"
		context.lineJoin = "round"
		context.lineCap = "round"
		context.lineWidth = 5

		this.drawRectangleWithRoundedCorners(context, 0, 0, canvas.width, canvas.height, this.LABEL_CORNER_RADIUS)

		// after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
		context.fillStyle = "rgba(0,0,0,1)"
		context.textAlign = "center"
		context.textBaseline = "middle"

		for (const [i, element] of multiLineContext.entries()) {
			context.fillText(element, canvas.width / 2, (canvas.height * (i + 1)) / (multiLineContext.length + 1))
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
			color: "rgba(224,224,224,0.85)",
			linewidth: 2
		})

		const geometry = new Geometry()
		geometry.vertices.push(new Vector3(x, y, z), new Vector3(x, y + 60, z))

		return new Line(geometry, material)
	}
}
