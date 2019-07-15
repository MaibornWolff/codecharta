import * as THREE from "three"
import { Scene } from "three"
import { Group } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { Vector3 } from "three"
import { SettingsService } from "../../../state/settings.service"

/**
 * A service which manages the Three.js scene in an angular way.
 */
export class ThreeSceneService {
	public scene: Scene
	public labels: Group
	public edgeArrows: Group
	public mapGeometry: Group
	private lights: Group
	private mapMesh: CodeMapMesh

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

	public highlightBuilding(highlightedBuilding: CodeMapBuilding) {
		const isPresentationMode = this.settingsService.getSettings().appSettings.isPresentationMode
		const mapSize = this.settingsService.getSettings().treeMapSettings.mapSize

		for (let i = 0; i < this.mapMesh.getMeshDescription().buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapMesh.getMeshDescription().buildings[i]
			const distance = highlightedBuilding.getCenterPoint(mapSize).distanceTo(currentBuilding.getCenterPoint(mapSize))

			if (currentBuilding.id !== highlightedBuilding.id) {
				if (isPresentationMode) {
					this.decreaseLightnessByDistance(currentBuilding, distance)
				} else {
					currentBuilding.decreaseLightness(20)
				}
			} else {
				currentBuilding.decreaseLightness(-10)
			}
			this.setVertexColor(currentBuilding.id, currentBuilding.getColorVector())
		}
		this.updateVertices()
	}

	public clearHighlight() {
		for (let i = 0; i < this.mapMesh.getMeshDescription().buildings.length; i++) {
			const currentBuilding: CodeMapBuilding = this.mapMesh.getMeshDescription().buildings[i]
			this.setVertexColor(currentBuilding.id, currentBuilding.getDefaultColorVector())
		}
		this.updateVertices()
	}

	private decreaseLightnessByDistance(building: CodeMapBuilding, distance: number) {
		if (distance > 800) {
			building.decreaseLightness(40)
		} else if (distance > 400) {
			building.decreaseLightness(30)
		} else if (distance > 250) {
			building.decreaseLightness(20)
		} else if (distance > 100) {
			building.decreaseLightness(15)
		} else if (distance > 50) {
			building.decreaseLightness(10)
		}
	}

	private setVertexColor(id: number, newColorVector: Vector3) {
		for (
			let j = id * CodeMapMesh.NUM_OF_VERTICES * CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS;
			j <
			id * CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS * CodeMapMesh.NUM_OF_VERTICES +
				CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS * CodeMapMesh.NUM_OF_VERTICES;
			j += CodeMapMesh.NUM_OF_COLOR_VECTOR_FIELDS
		) {
			this.mapMesh.getThreeMesh().geometry["attributes"].color.array[j] = newColorVector.x
			this.mapMesh.getThreeMesh().geometry["attributes"].color.array[j + 1] = newColorVector.y
			this.mapMesh.getThreeMesh().geometry["attributes"].color.array[j + 2] = newColorVector.z
		}
	}

	private updateVertices() {
		this.mapMesh.getThreeMesh().geometry["attributes"].color.needsUpdate = true
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
}
