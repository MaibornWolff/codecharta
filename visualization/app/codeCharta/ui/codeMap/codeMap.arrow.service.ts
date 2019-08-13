import {Node} from "../../codeCharta.model"
import {ThreeSceneService} from "./threeViewer/threeSceneService"
import {Edge} from "../../codeCharta.model"
import {
    ArrowHelper,
    BufferGeometry,
    CubicBezierCurve3,
    Line,
    LineBasicMaterial,
    Object3D,
    Vector3
} from "three"
import {SettingsService} from "../../state/settings.service"

export class CodeMapArrowService {
    private VERTICES_PER_LINE = 5

    private arrows: Object3D[]

    constructor(private threeSceneService: ThreeSceneService, private settingsService: SettingsService) {
        this.arrows = new Array<Object3D>()
    }

    public clearArrows() {
        this.arrows = []
        while (this.threeSceneService.edgeArrows.children.length > 0) {
            this.threeSceneService.edgeArrows.children.pop()
        }
    }

    public addEdgeArrowsFromOrigin(origin: Node, nodes: Node[], edges: Edge[]) {
        const originPath = origin.path
        const resEdges: Edge[] = edges.filter(x => x.fromNodeName === originPath)
        this.addEdgeArrows(nodes, resEdges)
    }

    public addEdgeArrows(nodes: Node[], edges: Edge[]) {
        const map = this.getNodesAsMap(nodes)

        for (const edge of edges) {
            const originNode: Node = map.get(edge.fromNodeName)
            const targetNode: Node = map.get(edge.toNodeName)

            if (originNode && targetNode) {
                this.addArrow(targetNode, originNode)
            }
        }
    }

    public addArrow(arrowTargetNode: Node, arrowOriginNode: Node): void {
        const mapSize = this.settingsService.getSettings().treeMapSettings.mapSize
        if (
            arrowTargetNode.attributes &&
            arrowTargetNode.attributes[this.settingsService.getSettings().dynamicSettings.heightMetric] &&
            arrowOriginNode.attributes &&
            arrowOriginNode.attributes[this.settingsService.getSettings().dynamicSettings.heightMetric]
        ) {
            const xTarget: number = arrowTargetNode.x0 - mapSize * 0.5
            const yTarget: number = arrowTargetNode.z0
            const zTarget: number = arrowTargetNode.y0 - mapSize * 0.5

            const wTarget: number = arrowTargetNode.width
            const hTarget: number = arrowTargetNode.height
            const lTarget: number = arrowTargetNode.length

            const xOrigin: number = arrowOriginNode.x0 - mapSize * 0.5
            const yOrigin: number = arrowOriginNode.z0
            const zOrigin: number = arrowOriginNode.y0 - mapSize * 0.5

            const wOrigin: number = arrowOriginNode.width
            const hOrigin: number = 1
            const lOrigin: number = arrowOriginNode.length

            const curve = new CubicBezierCurve3(
                new Vector3(xOrigin + wOrigin / 2, 1, zOrigin + lOrigin / 2),
                new Vector3(
                    xOrigin + wOrigin / 2,
                    (Math.max(yOrigin + hOrigin, yTarget + hTarget) + mapSize * 2),
                    zOrigin + lOrigin / 2
                ),
                new Vector3(xTarget + wTarget / 2, Math.max(yOrigin + hOrigin, yTarget + hTarget) + mapSize, zTarget + lTarget / 2),
                new Vector3(xTarget + wTarget / 2, yTarget + hTarget, zTarget + lTarget / 2)
            )

            const incomingArrow: Object3D = this.makeIncomingArrowFromBezier(curve)
            const outgoingArrow: Object3D = this.makeOutgoingArrowFromBezier(curve, arrowOriginNode.height)

            this.threeSceneService.edgeArrows.add(incomingArrow)
            this.threeSceneService.edgeArrows.add(outgoingArrow)
            this.arrows.push(incomingArrow)
            this.arrows.push(outgoingArrow)
        }
    }

    public scale(scale: Vector3) {
        for (const arrow of this.arrows) {
            arrow.scale.x = scale.x
            arrow.scale.y = scale.y
            arrow.scale.z = scale.z
        }
    }

    private getNodesAsMap(nodes: Node[]): Map<string, Node> {
        const map = new Map<string, Node>()
        nodes.forEach(node => map.set(node.path, node))
        return map
    }

    private makeIncomingArrowFromBezier(
        bezier: CubicBezierCurve3,
        bezierPoints: number = 50
    ): Object3D {
        const points = bezier.getPoints(bezierPoints)
        const pointsIncoming = points.slice(bezierPoints + 1 - this.VERTICES_PER_LINE)

        return this.buildIncomingEdge(pointsIncoming)
    }

    private makeOutgoingArrowFromBezier(
        bezier: CubicBezierCurve3,
        height: number,
        bezierPoints: number = 50
    ): Object3D {
        const points = bezier.getPoints(bezierPoints)
        const pointsOutgoing = this.getPointsToSurpassBuildingHeight(points, height)

        return this.buildOutgoingEdge(pointsOutgoing)
    }

    private buildIncomingEdge(points: Vector3[]): Object3D {
        const curveObject = this.buildLine(points)
        curveObject.add(this.buildArrow(points))

        return curveObject
    }

    private buildOutgoingEdge(points: Vector3[]): Object3D {
         const curveObject = this.buildLine(points)
        curveObject.add(this.buildArrow(points))

        return curveObject
    }

    private buildLine(points: Vector3[], color: number = 0) {
        const geometry = new BufferGeometry()
        geometry.setFromPoints(points)

        const material = new LineBasicMaterial({color, linewidth: 1})
        return new Line(geometry, material)
    }

    private buildArrow(points: Vector3[], ARROW_COLOR: number = 0, headLength: number = 10, headWidth: number = 10) {
        const dir = points[points.length - 1].clone().sub(points[points.length - 2].clone()).normalize()

        const origin = points[points.length - 1].clone()
        return new ArrowHelper(dir, origin, 0, ARROW_COLOR, headLength, headWidth)
    }

    private getPointsToSurpassBuildingHeight(points: Vector3[], height: number): Vector3[] {
        const THRESHHOLD = 100
        const result = []
        let length = 0
        let i = 0

        while (length < height + THRESHHOLD && i < points.length - 1) {
            length += points[i].distanceTo(points[i + 1])
            result.push(points[i])
            i++
        }

        return result
    }
}
