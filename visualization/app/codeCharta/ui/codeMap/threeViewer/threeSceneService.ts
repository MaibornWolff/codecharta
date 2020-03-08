import * as THREE from "three"
import { Scene, Vector3 } from "three"
import { Group } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { CodeMapPreRenderServiceSubscriber, CodeMapPreRenderService } from "../codeMap.preRender.service"
import { CodeMapNode, Node } from "../../../codeCharta.model"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"

export interface BuildingSelectedEventSubscriber {
	onBuildingSelected(selectedBuilding: CodeMapBuilding)
}

export interface BuildingDeselectedEventSubscriber {
	onBuildingDeselected()
}

export class ThreeSceneService implements CodeMapPreRenderServiceSubscriber {
	private static readonly BUILDING_SELECTED_EVENT = "building-selected"
	private static readonly BUILDING_DESELECTED_EVENT = "building-deselected"

	public scene: Scene
	public labels: Group
	public edgeArrows: Group
	public mapGeometry: Group
	private lights: Group
	private mapMesh: CodeMapMesh

	private selected: CodeMapBuilding = null
	private highlighted: CodeMapBuilding[] = []

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)

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

	public onRenderMapChanged(map: CodeMapNode) {
		this.reselectBuilding()
	}

	public highlightBuildings() {
		const state = this.storeService.getState()
		this.getMapMesh().highlightBuilding(this.highlighted, this.selected, state)
	}

	public highlightSingleBuilding(building: CodeMapBuilding) {
		this.highlighted = []
		this.addBuildingToHighlightingList(building)
		this.highlightBuildings()
	}

	public addBuildingToHighlightingList(building: CodeMapBuilding) {
		this.highlighted.push(building)
	}

	public clearHighlight() {
		if (this.getMapMesh()) {
			this.getMapMesh().clearHighlight(this.selected)
			this.highlighted = []
		}
	}

	public selectBuilding(building: CodeMapBuilding) {
		const color = this.storeService.getState().appSettings.mapColors.selected
		this.getMapMesh().selectBuilding(building, this.selected, color)
		this.selected = building
		this.highlightBuildings()
		this.$rootScope.$broadcast(ThreeSceneService.BUILDING_SELECTED_EVENT, this.selected)
	}

	public clearSelection() {
		if (this.selected) {
			this.getMapMesh().clearSelection(this.selected)
			this.$rootScope.$broadcast(ThreeSceneService.BUILDING_DESELECTED_EVENT)
		}
		if (this.highlighted.length > 0) {
			this.highlightBuildings()
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

		this.mapGeometry.position.x = -mapSize
		this.mapGeometry.position.y = 0.0
		this.mapGeometry.position.z = -mapSize

		this.mapGeometry.add(this.mapMesh.getThreeMesh())
	}

	public getMapMesh(): CodeMapMesh {
		return this.mapMesh
	}

	public scale(scale: Vector3, mapSize: number) {
		this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
		this.mapGeometry.position.set(-mapSize * scale.x, 0.0, -mapSize * scale.z)
		this.mapMesh.setScale(scale)
	}

	public getSelectedBuilding(): CodeMapBuilding {
		return this.selected
	}

	public getHighlightedBuilding(): CodeMapBuilding {
		return this.highlighted[0]
	}

	public getHighlightedNode(): Node {
		if (this.getHighlightedBuilding()) {
			return this.getHighlightedBuilding().node
		} else {
			return null
		}
	}

	private reselectBuilding() {
		if (this.selected) {
			const buildingToSelect: CodeMapBuilding = this.getMapMesh().getBuildingByPath(this.selected.node.path)
			if (buildingToSelect) {
				this.selectBuilding(buildingToSelect)
			}
		}
	}

	public static subscribeToBuildingDeselectedEvents($rootScope: IRootScopeService, subscriber: BuildingDeselectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_DESELECTED_EVENT, e => {
			subscriber.onBuildingDeselected()
		})
	}

	public static subscribeToBuildingSelectedEvents($rootScope: IRootScopeService, subscriber: BuildingSelectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_SELECTED_EVENT, (e, selectedBuilding: CodeMapBuilding) => {
			subscriber.onBuildingSelected(selectedBuilding)
		})
	}
}
