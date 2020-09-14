import { Sprite, Vector3, Box3, Sphere, LineBasicMaterial, Line, Geometry, LinearFilter, Texture, SpriteMaterial } from "three"
import { Node } from "../../codeCharta.model"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { IRootScopeService } from "angular"
import { ColorConverter } from "../../util/color/colorConverter"
import { StoreService } from "../../state/store.service"

interface InternalLabel {
	sprite: Sprite
	line: Line | null
	heightValue: number
}

export class CodeMapLabelService implements CameraChangeSubscriber {
	private labels: InternalLabel[]
	private LABEL_WIDTH_DIVISOR = 2100 // empirically gathered
	private LABEL_HEIGHT_DIVISOR = 40 // empirically gathered

	private currentScale: Vector3 = new Vector3(1, 1, 1)
	private resetScale = false

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService
	) {
		this.labels = new Array<InternalLabel>()
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	public addLabel(node: Node) {
		const state = this.storeService.getState()
		if (node.attributes?.[state.dynamicSettings.heightMetric]) {
			const x = node.x0 - state.treeMap.mapSize
			const y = node.z0
			const z = node.y0 - state.treeMap.mapSize

			const labelX = x + node.width / 2
			const labelY = y + node.height
			const labelZ = z + node.length / 2

			const label = this.makeText(`${node.name}: ${node.attributes[state.dynamicSettings.heightMetric]}`, 30)
			label.sprite.position.set(labelX, labelY + 60 + label.heightValue / 2, labelZ)
			label.line = this.makeLine(labelX, labelY, labelZ)

			this.threeSceneService.labels.add(label.sprite)
			this.threeSceneService.labels.add(label.line)

			this.labels.push(label)
		}
		this.resetScale = true
	}

	public clearLabels() {
		this.labels = []
		while (this.threeSceneService.labels.children.length > 0) {
			this.threeSceneService.labels.children.pop()
		}
	}

	public scale() {
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

	public onCameraChanged() {
		for (const label of this.labels) {
			this.setLabelSize(label.sprite)
		}
	}

	private makeText(message: string, fontsize: number): InternalLabel {
		const canvas = document.createElement("canvas")
		const context = canvas.getContext("2d")

		context.font = `${fontsize}px Helvetica Neue`

		const margin = 20

		// setting canvas width/height before ctx draw, else canvas is empty
		canvas.width = context.measureText(message).width + margin
		canvas.height = fontsize + margin

		// bg
		context.fillStyle = "rgba(255,255,255,1)"
		context.strokeStyle = ColorConverter.convertHexToRgba(this.storeService.getState().appSettings.mapColors.angularGreen)
		context.lineJoin = "round"
		context.lineCap = "round"
		context.lineWidth = 5
		context.fillRect(0, 0, canvas.width, canvas.height)
		context.strokeRect(0, 0, canvas.width, canvas.height)

		// after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
		context.font = `${fontsize}px Helvetica Neue`
		context.fillStyle = "rgba(0,0,0,1)"
		context.textAlign = "center"
		context.textBaseline = "middle"
		context.fillText(message, canvas.width / 2, canvas.height / 2)

		const texture = new Texture(canvas)
		texture.minFilter = LinearFilter // NearestFilter;
		texture.needsUpdate = true

		const spriteMaterial = new SpriteMaterial({ map: texture })
		const sprite = new Sprite(spriteMaterial)
		this.setLabelSize(sprite, canvas.width)

		return {
			sprite,
			heightValue: canvas.height,
			line: null
		}
	}

	private setLabelSize(sprite: Sprite, labelWidth: number = sprite.material.map.image.width) {
		const mapCenter = new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere(new Sphere()).center
		const distance = this.threeCameraService.camera.position.distanceTo(mapCenter)
		sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * labelWidth, distance / this.LABEL_HEIGHT_DIVISOR, 1)
	}

	private makeLine(x: number, y: number, z: number) {
		const material = new LineBasicMaterial({
			color: this.storeService.getState().appSettings.mapColors.angularGreen,
			linewidth: 2
		})

		const geometry = new Geometry()
		geometry.vertices.push(new Vector3(x, y, z), new Vector3(x, y + 60, z))

		return new Line(geometry, material)
	}
}
