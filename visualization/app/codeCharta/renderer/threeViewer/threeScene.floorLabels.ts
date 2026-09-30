import { Group, Object3D, Scene, Vector3 } from "three"
import { LayoutAlgorithm, Node, Scaling } from "../../model/codeCharta.model"
import { treeMapSize } from "./algorithm/treeMapLayout/treeMapHelper"
import { FloorLabelDrawer } from "./floorLabels/floorLabelDrawer"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { ThreeSceneStore } from "./stores/threeScene.store"
import { ThreeRendererService } from "./threeRenderer.service"

type DisposableLabelPlane = {
    geometry?: { dispose: () => void }
    material?: { map?: { dispose: () => void }; dispose: () => void }
}

export class ThreeSceneFloorLabels {
    private floorLabelDrawer: FloorLabelDrawer

    constructor(
        private readonly floorLabelPlanes: Group,
        private readonly threeSceneStore: ThreeSceneStore,
        private readonly threeRendererService: ThreeRendererService
    ) {}

    draw(nodes: Node[], mapMesh: CodeMapMesh, scene: Scene) {
        this.removePlanes()

        const { layoutAlgorithm, enableFloorLabels } = this.threeSceneStore.getMapState()
        if (layoutAlgorithm !== LayoutAlgorithm.SquarifiedTreeMap || !enableFloorLabels) {
            return
        }

        const rootNode = this.getRootNode(nodes)
        if (!rootNode) {
            return
        }
        this.floorLabelDrawer = this.createDrawer(mapMesh, rootNode)
        const floorLabels = this.floorLabelDrawer.draw()

        if (floorLabels.length > 0) {
            this.floorLabelPlanes.add(...floorLabels)
            scene.add(this.floorLabelPlanes)
        }
    }

    translate(scale: Scaling) {
        this.floorLabelDrawer?.translatePlaneCanvases(scale)
    }

    private removePlanes() {
        for (const child of this.floorLabelPlanes.children) {
            disposeLabelPlane(child)
        }
        this.floorLabelPlanes.clear()
    }

    private getRootNode(nodes: Node[]) {
        return nodes.find(node => node.id === 0)
    }

    private createDrawer(mapMesh: CodeMapMesh, rootNode: Node) {
        const { scaling } = this.threeSceneStore.getMapState()
        const { experimentalFeaturesEnabled } = this.threeSceneStore.getPreferences()
        const maxAnisotropy = this.threeRendererService.renderer?.capabilities.getMaxAnisotropy() ?? 1
        return new FloorLabelDrawer(
            mapMesh.getNodes(),
            rootNode,
            treeMapSize,
            new Vector3(scaling.x, scaling.y, scaling.z),
            experimentalFeaturesEnabled,
            maxAnisotropy
        )
    }
}

function disposeLabelPlane(child: Object3D) {
    const plane = child as unknown as DisposableLabelPlane
    plane.geometry?.dispose()
    if (plane.material) {
        plane.material.map?.dispose()
        plane.material.dispose()
    }
}
