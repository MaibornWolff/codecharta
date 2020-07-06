import * as THREE from "three"
import { PerspectiveCamera, Sprite, Vector3, Box3 } from "three"
import { Node, State } from "../../codeCharta.model"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { IRootScopeService } from "angular"
import { ColorConverter } from "../../util/color/colorConverter"
import { StoreService } from "../../state/store.service"

interface InternalLabel {
	sprite: THREE.Sprite
	line: THREE.Line | null
	heightValue: number
}

export class CodeMapLabelService implements CameraChangeSubscriber {
	private labels: InternalLabel[]
	private LABEL_WIDTH_DIVISOR = 2100 // empirically gathered
	private LABEL_HEIGHT_DIVISOR = 40 // empirically gathered

	private currentScale: Vector3 = new THREE.Vector3(1, 1, 1)
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

	public addLabel(node: Node): void {
		const state: State = this.storeService.getState()
		if (node.attributes && node.attributes[state.dynamicSettings.heightMetric]) {
			const x: number = node.x0 - state.treeMap.mapSize
			const y: number = node.z0
			const z: number = node.y0 - state.treeMap.mapSize

			const labelX: number = x + node.width / 2
			const labelY: number = y + node.height
			const labelZ: number = z + node.length / 2

			const label: InternalLabel = this.makeText(node.name + ": " + node.attributes[state.dynamicSettings.heightMetric], 30)
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
		const scaling: Vector3 = this.storeService.getState().appSettings.scaling
		if (this.resetScale) {
			this.resetScale = false
			this.currentScale = new THREE.Vector3(1, 1, 1)
		}

		for (const label of this.labels) {
			const labelHeightDifference = new Vector3(0, 60, 0)
			label.sprite.position
				.sub(labelHeightDifference.clone())
				.divide(this.currentScale.clone())
				.multiply(scaling.clone())
				.add(labelHeightDifference.clone())

			//cast is a workaround for the compiler. Attribute vertices does exist on geometry
			//but it is missing in the mapping file for TypeScript.
			;(<any>label.line.geometry).vertices[0].divide(this.currentScale.clone()).multiply(scaling.clone())
			;(<any>label.line.geometry).vertices[1].copy(label.sprite.position)
			label.line.geometry.translate(0, 0, 0)
		}
		this.currentScale.copy(scaling)
	}

	public onCameraChanged(camera: PerspectiveCamera) {
		for (const label of this.labels) {
			this.setLabelSize(label.sprite)
		}
	}

	private makeText(message: string, fontsize: number): InternalLabel {
		const canvas = document.createElement("canvas")
		const ctx = canvas.getContext("2d")

		ctx.font = fontsize + "px Helvetica Neue"

		const margin = 20

		// setting canvas width/height before ctx draw, else canvas is empty
		canvas.width = ctx.measureText(message).width + margin
		canvas.height = fontsize + margin

		//bg
		ctx.fillStyle = "rgba(255,255,255,1)"
		ctx.strokeStyle = ColorConverter.convertHexToRgba(this.storeService.getState().appSettings.mapColors.angularGreen)
		ctx.lineJoin = "round"
		ctx.lineCap = "round"
		ctx.lineWidth = 5
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.strokeRect(0, 0, canvas.width, canvas.height)

		// after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
		ctx.font = fontsize + "px Helvetica Neue"
		ctx.fillStyle = "rgba(0,0,0,1)"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText(message, canvas.width / 2, canvas.height / 2)

		const texture = new THREE.Texture(canvas)
		texture.minFilter = THREE.LinearFilter // NearestFilter;
		texture.needsUpdate = true

		const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
		const sprite = new THREE.Sprite(spriteMaterial)
		this.setLabelSize(sprite, canvas.width)

		return {
			sprite,
			heightValue: canvas.height,
			line: null
		}
	}

	private setLabelSize(sprite: Sprite, currentLabelWidth: number = undefined) {
		const mapCenter = new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere().center
		const distance = this.threeCameraService.camera.position.distanceTo(mapCenter)
		const resultingLabelWidth = !currentLabelWidth ? sprite.material.map.image.width : currentLabelWidth
		sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * resultingLabelWidth, distance / this.LABEL_HEIGHT_DIVISOR, 1)
	}

	private makeLine(x: number, y: number, z: number): THREE.Line {
		const material = new THREE.LineBasicMaterial({
			color: this.storeService.getState().appSettings.mapColors.angularGreen,
			linewidth: 2
		})

		const geometry = new THREE.Geometry()
		geometry.vertices.push(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + 60, z))

		return new THREE.Line(geometry, material)
	}
}
