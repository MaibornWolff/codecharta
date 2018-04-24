import * as THREE from "three";
import {node} from "./node";
import {renderSettings} from "./renderSettings";
import {Group, Object3D, Vector3} from "three";
import {CodeMapDependency} from "../../../core/data/model/CodeMap";

export class ArrowManager {
    private parentObjectInScene: THREE.Object3D;
    private arrows: THREE.Object3D[];

    constructor(argParentObjectInScene: THREE.Object3D) {
        this.parentObjectInScene = argParentObjectInScene;
        this.arrows = new Array<THREE.Object3D>();
    }

    private makeArrowFromBezier(bezier: THREE.CubicBezierCurve3,
                                hex: number = 0,
                                headLength: number = 10,
                                headWidth: number = 10,
                                bezierPoints: number = 50): THREE.Object3D {

        let points = bezier.getPoints(bezierPoints);

        // arrowhead
        let dir = points[points.length - 1].clone().sub(points[points.length - 2].clone());
        dir.normalize();
        let origin = points[points.length - 1].clone();
        let arrowHelper = new THREE.ArrowHelper(dir, origin, 0, hex, headLength, headWidth);

        // curve
        let geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(points);
        let material = new THREE.LineBasicMaterial({color: hex, linewidth: 1});
        let curveObject = new THREE.Line(geometry, material);

        //combine
        curveObject.add(arrowHelper);
        return curveObject;
    }

    public clearArrows() {
        this.arrows = [];
        while (this.parentObjectInScene.children.length > 0) {
            this.parentObjectInScene.children.pop();
        }
    }

    public addCodeMapDependenciesFromOriginAsArrows(origin: node, nodes: node[], deps: CodeMapDependency[], settings: renderSettings) {
        let resDeps: CodeMapDependency[] = [];
        let originPath = this.getPathFromNode(origin);
        for(let i=0; i<deps.length; i++){
            if(deps[i].node === originPath) {
                resDeps.push(deps[i]);
            }
        }
        this.addCodeMapDependenciesAsArrows(nodes, resDeps, settings);
    }

    public addCodeMapDependenciesAsArrows(nodes: node[], deps: CodeMapDependency[], settings: renderSettings) {

        let map = this.getPathToNodeMap(nodes);

        for (let i = 0; i < deps.length; i++) {
            let originNode: node = map.get(deps[i].node);
            let targetNode: node = map.get(deps[i].dependsOn);
            if (originNode && targetNode) {
                this.addArrow(targetNode, originNode, settings);
            }
        }

    }

    private getPathToNodeMap(nodes: node[]): Map<string, node> {
        let map = new Map<string, node>();

        for (let node of nodes) {
            map.set(this.getPathFromNode(node), node);
        }

        return map;
    }

    private getPathFromNode(node: node): string {
        let current: node = node;
        let path = "";
        while (current) {
            path = "/" + current.name + path;
            current = current.parent;
        }
        return path;
    }

    public addArrow(arrowTargetNode: node, arrowOriginNode: node, settings: renderSettings): void {

        if (arrowTargetNode.attributes && arrowTargetNode.attributes[settings.heightKey] && arrowOriginNode.attributes && arrowOriginNode.attributes[settings.heightKey]) {

            let xTarget: number = arrowTargetNode.x0 - settings.mapSize * 0.5;
            let yTarget: number = arrowTargetNode.z0;
            let zTarget: number = arrowTargetNode.y0 - settings.mapSize * 0.5;

            let wTarget: number = arrowTargetNode.width;
            let hTarget: number = arrowTargetNode.height;
            let lTarget: number = arrowTargetNode.length;

            let xOrigin: number = arrowOriginNode.x0 - settings.mapSize * 0.5;
            let yOrigin: number = arrowOriginNode.z0;
            let zOrigin: number = arrowOriginNode.y0 - settings.mapSize * 0.5;

            let wOrigin: number = arrowOriginNode.width;
            let hOrigin: number = arrowOriginNode.height;
            let lOrigin: number = arrowOriginNode.length;

            let curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(xOrigin + wOrigin / 2, yOrigin + hOrigin, zOrigin + lOrigin / 2),
                new THREE.Vector3(xOrigin + wOrigin / 2, Math.max(yOrigin + hOrigin, yTarget + hTarget) + settings.mapSize, zOrigin + lOrigin / 2),
                new THREE.Vector3(xTarget + wTarget / 2, Math.max(yOrigin + hOrigin, yTarget + hTarget) + settings.mapSize, zTarget + lTarget / 2),
                new THREE.Vector3(xTarget + wTarget / 2, yTarget + hTarget, zTarget + lTarget / 2)
            );

            let arrow: THREE.Object3D = this.makeArrowFromBezier(curve);

            this.parentObjectInScene.add(arrow);
            this.arrows.push(arrow);

        }

    }

    public scale(x: number, y: number, z: number) {
        for (let arrow of this.arrows) {
            arrow.scale.x = x;
            arrow.scale.y = y;
            arrow.scale.z = z;
        }
    }

}