import { Node, CcState } from "../../../codeCharta.model"
import { CodeMapGeometricDescription } from "./codeMapGeometricDescription"
import { CodeMapBuilding } from "./codeMapBuilding"
import { createTemplateBoxGeometry, BoxMeasures } from "./geometryGenerationHelper"
import { ColorConverter } from "../../../util/color/colorConverter"
import { InstancedMesh, InstancedBufferAttribute, Material, Matrix4, Vector3, Box3 } from "three"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"

export interface BuildResult {
    mesh: InstancedMesh
    desc: CodeMapGeometricDescription
}

interface BuildContext {
    desc: CodeMapGeometricDescription
    instanceColors: Float32Array
    instanceDeltaColors: Float32Array
    instanceDeltas: Float32Array
    instanceIsLeaf: Float32Array
    matrix: Matrix4
    position: Vector3
    scale: Vector3
    mesh: InstancedMesh
}

export class GeometryGenerator {
    /** Minimum height in scene units so that every building remains visible,
     *  even when its height metric value rounds to zero. */
    private static MINIMAL_BUILDING_HEIGHT = 1

    private floorGradient: string[]

    build(nodes: Node[], material: Material, state: CcState, isDeltaState: boolean): BuildResult {
        this.floorGradient = ColorConverter.gradient("#333333", "#DDDDDD", this.getMaxNodeDepth(nodes))

        const count = nodes.length
        const templateGeometry = createTemplateBoxGeometry()

        const ctx: BuildContext = {
            desc: new CodeMapGeometricDescription(treeMapSize),
            instanceColors: new Float32Array(count * 3),
            instanceDeltaColors: new Float32Array(count * 3),
            instanceDeltas: new Float32Array(count),
            instanceIsLeaf: new Float32Array(count),
            matrix: new Matrix4(),
            position: new Vector3(),
            scale: new Vector3(),
            mesh: new InstancedMesh(templateGeometry, material, count)
        }

        templateGeometry.setAttribute("color", new InstancedBufferAttribute(ctx.instanceColors, 3))
        templateGeometry.setAttribute("deltaColor", new InstancedBufferAttribute(ctx.instanceDeltaColors, 3))
        templateGeometry.setAttribute("delta", new InstancedBufferAttribute(ctx.instanceDeltas, 1))
        templateGeometry.setAttribute("isLeaf", new InstancedBufferAttribute(ctx.instanceIsLeaf, 1))

        for (const [index, node] of nodes.entries()) {
            this.fillInstance(index, node, state, isDeltaState, ctx)
        }

        // InstancedMesh bounding sphere is computed from template geometry only (unit box).
        // Disable frustum culling so the mesh is always drawn regardless of camera position.
        ctx.mesh.frustumCulled = false

        return { mesh: ctx.mesh, desc: ctx.desc }
    }

    private getMaxNodeDepth(nodes: Node[]) {
        return nodes.reduce((max, { depth }) => Math.max(depth, max), 0)
    }

    private mapNodeToLocalBox(node: Node): BoxMeasures {
        return {
            x: node.x0,
            y: node.z0,
            z: node.y0,
            width: node.width,
            height: node.height,
            depth: node.length
        }
    }

    private ensureMinHeightUnlessDeltaIsNegative(height: number, delta: number) {
        return delta <= 0 ? height : Math.max(height, GeometryGenerator.MINIMAL_BUILDING_HEIGHT)
    }

    /** Dispatches to the floor or building fill path based on whether the node is a leaf. */
    private fillInstance(index: number, node: Node, state: CcState, isDeltaState: boolean, ctx: BuildContext) {
        if (!node.isLeaf) {
            const color = this.getMarkingColorWithGradient(node)
            const measures = this.mapNodeToLocalBox(node)
            this.fillInstanceBase(index, measures, node, color, 0, 0, ctx)
        } else {
            const measures = this.mapNodeToLocalBox(node)
            measures.height = this.ensureMinHeightUnlessDeltaIsNegative(node.height, node.heightDelta)

            let renderDelta = 0

            if (isDeltaState && node.deltas && node.deltas[state.dynamicSettings.heightMetric] && node.heightDelta) {
                renderDelta = node.heightDelta

                if (!node.flat && renderDelta < 0) {
                    measures.height += Math.abs(renderDelta)
                }
            }

            const normalizedDelta = measures.height > 0 ? renderDelta / measures.height : 0
            this.fillInstanceBase(index, measures, node, node.color, normalizedDelta, 1, ctx)
        }
    }

    /** Writes all per-instance attributes common to both floors and buildings. */
    private fillInstanceBase(
        index: number,
        measures: BoxMeasures,
        node: Node,
        color: string,
        normalizedDelta: number,
        isLeaf: number,
        ctx: BuildContext
    ) {
        this.addBuildingToDesc(index, measures, node, color, ctx.desc)
        this.setInstanceTransform(index, measures, ctx)
        this.setInstanceColor(index, color, ctx.instanceColors)
        this.setInstanceColor(index, color, ctx.instanceDeltaColors)
        ctx.instanceDeltas[index] = normalizedDelta
        ctx.instanceIsLeaf[index] = isLeaf
    }

    private getMarkingColorWithGradient(node: Node) {
        if (node.markingColor) {
            const markingColorAsNumber = ColorConverter.getNumber(node.markingColor)
            const markingColorWithGradient = this.applyDepthGradient(markingColorAsNumber, node.depth)
            return ColorConverter.convertNumberToHex(markingColorWithGradient)
        }
        return this.floorGradient[node.depth]
    }

    /**
     * Darkens a floor's marking color based on its depth in the tree.
     * Odd-depth floors keep full brightness (mask 0xffffff), while even-depth
     * floors are dimmed by masking with 0xdddddd, creating a subtle alternating
     * depth gradient that makes nesting levels visually distinguishable.
     */
    private applyDepthGradient(color: number, depth: number): number {
        const mask = depth % 2 === 0 ? 0xdd_dd_dd : 0xff_ff_ff
        return color & mask
    }

    private addBuildingToDesc(index: number, measures: BoxMeasures, node: Node, color: string, desc: CodeMapGeometricDescription) {
        desc.add(
            new CodeMapBuilding(
                index,
                new Box3(
                    new Vector3(measures.x, measures.y, measures.z),
                    new Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
                ),
                node,
                color
            )
        )
    }

    private setInstanceTransform(index: number, measures: BoxMeasures, ctx: BuildContext) {
        ctx.position.set(measures.x, measures.y, measures.z)
        ctx.scale.set(measures.width, measures.height, measures.depth)
        ctx.matrix.makeScale(ctx.scale.x, ctx.scale.y, ctx.scale.z)
        ctx.matrix.setPosition(ctx.position)
        ctx.mesh.setMatrixAt(index, ctx.matrix)
    }

    private setInstanceColor(index: number, color: string, target: Float32Array) {
        const rgb = ColorConverter.getVector3Array(color)
        target[index * 3] = rgb[0]
        target[index * 3 + 1] = rgb[1]
        target[index * 3 + 2] = rgb[2]
    }
}
