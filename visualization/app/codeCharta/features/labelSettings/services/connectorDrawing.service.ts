import { Injectable } from "@angular/core"
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments, Vector3 } from "three"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { InternalLabel } from "./labelCreation.service"
import { BASE_OFFSET_PX, MAX_CONNECTORS, MAX_DISPLACEMENT_PX, MIN_CONNECTOR_DISTANCE } from "./label.constants"

export interface LabelLayoutInfo {
    label: InternalLabel
    rect: DOMRect
    offset: number
    hidden: boolean
}

@Injectable({ providedIn: "root" })
export class ConnectorDrawingService {
    private connectorSegments: LineSegments | null = null
    private connectorPositions: Float32Array | null = null
    private connectorsDirty = true
    private readonly projectionVec = new Vector3()

    constructor(
        private readonly threeRendererService: ThreeRendererService,
        private readonly threeSceneService: ThreeSceneService
    ) {}

    drawConnectors(infos: LabelLayoutInfo[], suppressedLabel: InternalLabel | null) {
        if (!this.connectorSegments) {
            this.initConnectors()
        }

        const camera = this.threeRendererService.camera
        if (!camera) {
            return
        }

        const container = this.threeRendererService.labelRenderer?.domElement
        const viewportH = container ? container.clientHeight : window.innerHeight
        if (viewportH === 0) {
            return
        }

        const positions = this.connectorPositions
        let vertexIndex = 0

        for (const info of infos) {
            if (info.hidden || info.offset > MAX_DISPLACEMENT_PX || info.label === suppressedLabel) {
                continue
            }

            const buildingTop = info.label.buildingTop
            const labelPos = info.label.labelElement.cssObject.position

            const dy = labelPos.y - buildingTop.y
            if (dy < MIN_CONNECTOR_DISTANCE) {
                continue
            }

            if (vertexIndex >= MAX_CONNECTORS * 2) {
                break
            }

            // Compute line endpoint at the label's visual bottom.
            // The CSS transform translateY(BASE_OFFSET_PX + offset) shifts the label
            // in screen space. Convert that shift to a world-space point by
            // projecting the anchor to NDC, adjusting Y, and unprojecting.
            this.projectionVec.copy(labelPos).project(camera)
            const cssOffsetPx = BASE_OFFSET_PX + info.offset
            this.projectionVec.y -= (cssOffsetPx * 2) / viewportH
            this.projectionVec.unproject(camera)

            const vi = vertexIndex * 3
            positions[vi] = buildingTop.x
            positions[vi + 1] = buildingTop.y
            positions[vi + 2] = buildingTop.z
            vertexIndex++

            const vi2 = vertexIndex * 3
            positions[vi2] = this.projectionVec.x
            positions[vi2 + 1] = this.projectionVec.y
            positions[vi2 + 2] = this.projectionVec.z
            vertexIndex++
        }

        this.connectorSegments.geometry.setDrawRange(0, vertexIndex)
        ;(this.connectorSegments.geometry.attributes.position as BufferAttribute).needsUpdate = true
    }

    clearConnectors() {
        if (this.connectorSegments) {
            this.connectorSegments.geometry.setDrawRange(0, 0)
        }
        this.connectorsDirty = true
    }

    isDirty(): boolean {
        return this.connectorsDirty
    }

    markClean() {
        this.connectorsDirty = false
    }

    destroy() {
        if (this.connectorSegments) {
            this.connectorSegments.geometry.dispose()
            ;(this.connectorSegments.material as LineBasicMaterial).dispose()
            this.threeSceneService.scene.remove(this.connectorSegments)
            this.connectorSegments = null
            this.connectorPositions = null
        }
    }

    private initConnectors() {
        const maxVertices = MAX_CONNECTORS * 2
        this.connectorPositions = new Float32Array(maxVertices * 3)
        const geometry = new BufferGeometry()
        geometry.setAttribute("position", new BufferAttribute(this.connectorPositions, 3))
        geometry.setDrawRange(0, 0)

        const material = new LineBasicMaterial({
            color: 0xb4_b4_b4,
            transparent: true,
            opacity: 0.9,
            depthTest: true
        })

        this.connectorSegments = new LineSegments(geometry, material)
        this.connectorSegments.frustumCulled = false
        this.threeSceneService.scene.add(this.connectorSegments)
    }
}
