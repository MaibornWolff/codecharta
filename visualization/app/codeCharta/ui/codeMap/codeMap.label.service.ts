import * as THREE from "three"
import { PerspectiveCamera, Sprite, Vector3 } from "three"
import { Node, Settings } from "../../codeCharta.model"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ColorConverter } from "../../util/colorConverter"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"

interface InternalLabel {
	sprite: THREE.Sprite
	line: THREE.Line | null
	heightValue: number
}

export class CodeMapLabelService implements CameraChangeSubscriber {
	private labels: InternalLabel[]
	private LABEL_WIDTH_DIVISOR: number = 2600 // empirically gathered
	private LABEL_HEIGHT_DIVISOR: number = 50 // empirically gathered

	private currentHeightScale: number = 1
	private resetScale: boolean = false

	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService
	) {
		this.labels = new Array<InternalLabel>()
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	public addLabel(node: Node, settings: Settings): void {
		if (node.attributes && node.attributes[settings.dynamicSettings.heightMetric]) {
			const x: number = node.x0 - settings.treeMapSettings.mapSize * 0.5
			const y: number = node.z0
			const z: number = node.y0 - settings.treeMapSettings.mapSize * 0.5

			const labelX: number = x + node.width / 2
			const labelY: number = y + node.height
			const labelZ: number = z + node.length / 2

			let label: InternalLabel = this.makeText(node.name + ": " + node.attributes[settings.dynamicSettings.heightMetric], 30)
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

	public scale(scale: Vector3) {
		if (this.resetScale) {
			this.resetScale = false
			this.currentHeightScale = 1
		}

		for (let label of this.labels) {
			label.sprite.position.y = ((label.sprite.position.y - 60) / this.currentHeightScale) * scale.y + 60

			//cast is a workaround for the compiler. Attribute vertices does exist on geometry
			//but it is missing in the mapping file for TypeScript.
			;(<any>label.line!.geometry).vertices[0].y = ((<any>label.line!.geometry).vertices[0].y / this.currentHeightScale) * scale.y
			;(<any>label.line!.geometry).vertices[1].y = label.sprite.position.y
			label.line.geometry.translate(0, 0, 0)
		}
		this.currentHeightScale = scale.y
	}

	public onCameraChanged(camera: PerspectiveCamera, event: angular.IAngularEvent) {
		for (let label of this.labels) {
			this.setLabelSize(label.sprite)
		}
	}

	private makeText(message: string, fontsize: number): InternalLabel {
		const canvas = document.createElement("canvas")
		const ctx = canvas.getContext("2d")
		ctx!.font = fontsize + "px Helvetica Neue"

		const margin = 20

		// setting canvas width/height before ctx draw, else canvas is empty
		canvas.width = ctx!.measureText(message).width + margin
		canvas.height = fontsize + margin

		//bg
		ctx!.fillStyle = "rgba(255,255,255,1)"
		ctx!.strokeStyle = ColorConverter.convertHexToRgba(this.settingsService.getSettings().appSettings.mapColors.angularGreen)
		ctx!.lineJoin = "round"
		ctx!.lineCap = "round"
		ctx!.lineWidth = 5
		ctx!.fillRect(0, 0, canvas.width, canvas.height)
		ctx!.strokeRect(0, 0, canvas.width, canvas.height)

		// after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
		ctx!.font = fontsize + "px Helvetica Neue"
		ctx!.fillStyle = "rgba(0,0,0,1)"
		ctx!.textAlign = "center"
		ctx!.textBaseline = "middle"
		ctx!.fillText(message, canvas.width / 2, canvas.height / 2)

		const texture = new THREE.Texture(canvas)
		texture.minFilter = THREE.LinearFilter // NearestFilter;
		texture.needsUpdate = true

		const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
		const sprite = new THREE.Sprite(spriteMaterial)
		this.setLabelSize(sprite, canvas.width)

		return {
			sprite: sprite,
			heightValue: canvas.height,
			line: null
		}
	}

	private setLabelSize(sprite: Sprite, currentLabelWidth: number = undefined) {
		const distance = this.threeCameraService.camera.position.distanceTo(this.threeSceneService.mapGeometry.position)
		const resultingLabelWidth = !currentLabelWidth ? sprite.material.map.image.width : currentLabelWidth
		sprite.scale.set((distance / this.LABEL_WIDTH_DIVISOR) * resultingLabelWidth, distance / this.LABEL_HEIGHT_DIVISOR, 1)
	}

	private makeLine(x: number, y: number, z: number): THREE.Line {
		const material = new THREE.LineBasicMaterial({
			color: this.settingsService.getSettings().appSettings.mapColors.angularGreen,
			linewidth: 2
		})

		const geometry = new THREE.Geometry()
		geometry.vertices.push(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + 60, z))

		return new THREE.Line(geometry, material)
	}
}
