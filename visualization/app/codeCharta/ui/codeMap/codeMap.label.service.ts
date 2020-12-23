import { Sprite, Vector3, Box3, Sphere, LineBasicMaterial, Line, Geometry, LinearFilter, Texture, SpriteMaterial, Color } from "three"
import { LayoutAlgorithm, Node } from "../../codeCharta.model"
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
	node: Node
}

export class CodeMapLabelService implements CameraChangeSubscriber {
	private labels: InternalLabel[]
	private mapLabelColors = this.storeService.getState().appSettings.mapColors.labelColorAndAlpha
	private LABEL_COLOR_RGB = ColorConverter.convertHexToRgba(this.mapLabelColors.rgb)
	private LABEL_WIDTH_DIVISOR = 2100 // empirically gathered
	private LABEL_HEIGHT_DIVISOR = 35 // empirically gathered
	private LABEL_CORNER_RADIUS = 40 //empirically gathered
	private LABEL_SCALE_FACTOR = 0.7 //empirically gathered
	private LABEL_HEIGHT_COEFFICIENT = 15 / 4 //empirically gathered, needed to prevent label collision with building with higher margin, TODO scale with margin factor once its avalible
	private LABEL_HEIGHT_POSITION = 60

	private previousScaling: Vector3 = new Vector3(1, 1, 1)
	private lineCount = 1
	private nodeHeight = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService
	) {
		this.labels = new Array<InternalLabel>()
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	//labels need to be scaled according to map or it will clip + looks bad
	addLabel(node: Node, options: { showNodeName: boolean; showNodeMetric: boolean }, highestNode: number) {
		this.nodeHeight = this.nodeHeight > highestNode ? this.nodeHeight : highestNode
		// todo: tk rename to addLeafLabel
		const state = this.storeService.getState()
		const x = node.x0 - state.treeMap.mapSize
		const y = node.z0
		const z = node.y0 - state.treeMap.mapSize

		const labelX = x + node.width / 2
		const labelY = y + this.nodeHeight
		const labelYOrigin = y + node.height
		const labelZ = z + node.length / 2

		if (node.attributes?.[state.dynamicSettings.heightMetric]) {
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

			const label = this.makeText(labelText, 30, node)
			const { margin } = this.storeService.getState().dynamicSettings
			const {
				appSettings: { layoutAlgorithm }
			} = state
			const labelHeightScaled = this.LABEL_HEIGHT_COEFFICIENT * margin * this.LABEL_SCALE_FACTOR
			let labelOffset = labelHeightScaled + label.heightValue / 2

			switch (layoutAlgorithm) {
				// !remark : algorithm scaling is not same as the squarified layout,
				// !layout offset needs to be scaled down,the divided by value is just empirical,
				// TODO !needs further investigation
				case LayoutAlgorithm.StreetMap:
				case LayoutAlgorithm.TreeMapStreet:
					labelOffset /= 10
					this.LABEL_HEIGHT_POSITION = 0
					label.line = this.makeLine(labelX, labelY + labelOffset, labelYOrigin, labelZ)
					break
				default:
					label.line = this.makeLine(labelX, labelY + labelHeightScaled / 2, labelYOrigin, labelZ)
			}

			label.sprite.position.set(labelX, labelY + labelOffset, labelZ) //label_height
			label.sprite.material.color = new Color(this.mapLabelColors.rgb)
			label.sprite.material.opacity = this.mapLabelColors.alpha
			label.sprite.userData = { node }

			this.threeSceneService.labels.add(label.sprite)
			this.threeSceneService.labels.add(label.line)

			this.labels.push(label) // todo tk: why is the duplication of this.labels and threeSceneService.labels needed? To sync label.sprite with label.line I guess - is there maybe a nicer solution for that?
		}
	}

	clearLabels() {
		this.labels = []
		this.nodeHeight = 0
		this.LABEL_HEIGHT_POSITION = 60
		// Reset the children
		this.threeSceneService.labels.children.length = 0
	}

	clearTemporaryLabel(hoveredNode: Node) {
		const index = this.labels.findIndex(({ node }) => node === hoveredNode)
		if (index > -1) {
			this.labels.splice(index, 1)
			this.threeSceneService.labels.children.length -= 2
		}
	}

	scale() {
		const { scaling } = this.storeService.getState().appSettings
		const { margin } = this.storeService.getState().dynamicSettings

		const multiplier = scaling.clone().divide(this.previousScaling)

		for (const label of this.labels) {
			const labelHeightDifference = new Vector3(0, this.LABEL_HEIGHT_COEFFICIENT * margin * this.LABEL_SCALE_FACTOR, 0)
			label.sprite.position.sub(labelHeightDifference).multiply(multiplier).add(labelHeightDifference)

			// Attribute vertices does exist on geometry but it is missing in the mapping file for TypeScript.
			label.line.geometry["vertices"][0].multiply(multiplier)
			label.line.geometry["vertices"][1] = label.sprite.position
			label.line.geometry.translate(0, 0, 0)
		}

		this.previousScaling.copy(scaling)
	}

	onCameraChanged() {
		for (const label of this.labels) {
			this.setLabelSize(label.sprite, label.sprite.material.map.image.width, label)
		}
	}

	private makeText(message: string, fontsize: number, node: Node): InternalLabel {
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
		context.fillStyle = "rgba(255,255,255,1)"
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
			lineCount: multiLineContext.length,
			node
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

	private makeLine(x: number, y: number, yOrigin: number, z: number) {
		const material = new LineBasicMaterial({
			color: this.LABEL_COLOR_RGB,
			linewidth: 2
		})

		const geometry = new Geometry()
		geometry.vertices.push(new Vector3(x, yOrigin, z), new Vector3(x, y + this.LABEL_HEIGHT_POSITION, z))

		return new Line(geometry, material)
	}
}
