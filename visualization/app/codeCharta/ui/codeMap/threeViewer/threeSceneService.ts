import * as THREE from "three"
import { Scene, Vector3 } from "three"
import { Group } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { SettingsService } from "../../../state/settingsService/settings.service"

export class ThreeSceneService {
	public scene: Scene
	public labels: Group
	public edgeArrows: Group
	public mapGeometry: Group
	private lights: Group
	private mapMesh: CodeMapMesh

	private selected: CodeMapBuilding = null
	private highlighted: CodeMapBuilding = null
	private highlightedBuildings: CodeMapBuilding[] = []

	constructor(private settingsService: SettingsService) {
		this.scene = new THREE.Scene()

		this.mapGeometry = new THREE.Group()
		this.lights = new THREE.Group()
		this.labels = new THREE.Group()
		this.edgeArrows = new THREE.Group()

		this.initLights()

		this.scene.add(this.mapGeometry)
		this.scene.add(this.edgeArrows)
		this.scene.add(this.labels)
		this.scene.add(this.lights)
	}

	public highlightBuilding(building: CodeMapBuilding) {
		const settings = this.settingsService.getSettings()
		this.getMapMesh().highlightBuilding(building, this.selected, settings)
		this.highlightedBuildings = []
		this.highlighted = building
	}

	public addBuildingToHighlightingList(building: CodeMapBuilding) {
		const settings = this.settingsService.getSettings()
		this.highlightedBuildings.push(building)
		this.getMapMesh().highlightBuildings(this.highlightedBuildings, this.selected, settings)
	}

	public clearHighlight() {
		this.getMapMesh().clearHighlight(this.selected)
		this.highlighted = null
		this.highlightedBuildings = []
	}

	public selectBuilding(building: CodeMapBuilding) {
		const color = this.settingsService.getSettings().appSettings.mapColors.selected
		this.getMapMesh().selectBuilding(building, this.selected, color)
		this.selected = building
	}

	public reselectBuilding() {
		if (this.selected) {
			this.selectBuilding(this.selected)
		}
	}

	public clearSelection() {
		if (this.selected) {
			this.getMapMesh().clearSelection(this.selected)
		}
		if (this.highlighted) {
			this.getMapMesh().highlightBuilding(this.highlighted, null, this.settingsService.getSettings())
		}
		this.selected = null
	}

	public initLights() {
		const ambilight = new THREE.AmbientLight(0x707070) // soft white light
		const light1 = new THREE.DirectionalLight(0xe0e0e0, 1)
		light1.position.set(50, 10, 8).normalize()
		light1.castShadow = false
		light1.shadow.camera.right = 5
		light1.shadow.camera.left = -5
		light1.shadow.camera.top = 5
		light1.shadow.camera.bottom = -5
		light1.shadow.camera.near = 2
		light1.shadow.camera.far = 100

		const light2 = new THREE.DirectionalLight(0xe0e0e0, 1)
		light2.position.set(-50, 10, -8).normalize()
		light2.castShadow = false
		light2.shadow.camera.right = 5
		light2.shadow.camera.left = -5
		light2.shadow.camera.top = 5
		light2.shadow.camera.bottom = -5
		light2.shadow.camera.near = 2
		light2.shadow.camera.far = 100

		this.lights.add(ambilight)
		this.lights.add(light1)
		this.lights.add(light2)
	}

	public setMapMesh(mesh: CodeMapMesh, mapSize: number) {
		this.mapMesh = mesh

		while (this.mapGeometry.children.length > 0) {
			this.mapGeometry.remove(this.mapGeometry.children[0])
		}

		this.mapGeometry.position.x = -mapSize / 2.0
		this.mapGeometry.position.y = 0.0
		this.mapGeometry.position.z = -mapSize / 2.0

		this.mapGeometry.add(this.mapMesh.getThreeMesh())
	}

	public getMapMesh(): CodeMapMesh {
		return this.mapMesh
	}

	public scale(scale: Vector3, mapSize: number) {
		this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
		this.mapGeometry.position.set((-mapSize / 2.0) * scale.x, 0.0, (-mapSize / 2.0) * scale.z)
		this.mapMesh.setScale(scale)
	}

	public getSelectedBuilding(): CodeMapBuilding {
		return this.selected
	}

	public getHighlightedBuilding(): CodeMapBuilding {
		return this.highlighted
	}
}
