import * as THREE from "three";
import {node} from "./node"
import {renderSettings} from "./renderSettings"
import {Group, Object3D} from "three";

export class ArrowManager {
    private parentObjectInScene: THREE.Object3D;
    private arrows: THREE.Object3D[];

    constructor(argParentObjectInScene: THREE.Object3D) {
        this.parentObjectInScene = argParentObjectInScene;
        this.arrows = new Array<THREE.Object3D>();

        this.addArrow({}, {});
    }

    makeArrowFromBezier(bezier: THREE.CubicBezierCurve3,
                        hex: number = 0,
                        flipped: boolean = false,
                        headLength: number = 2,
                        headWidth: number = 2,
                        bezierPoints: number = 50): THREE.Object3D {

        let points = bezier.getPoints(bezierPoints);

        // arrowhead
        let dir = points[points.length - 1].clone().sub(points[points.length - 2].clone());
        if (flipped) {
            let dir = points[1].clone().sub(points[0].clone()); //TODO sth wrong while flipping
        }
        dir.normalize();
        let origin = flipped ? points[0].clone() : points[points.length - 1].clone(); //TODO sth wrong while flipping
        let arrowHelper = new THREE.ArrowHelper(dir, origin, 0, hex, headLength, headWidth);

        // curve
        let geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(points);
        let material = new THREE.LineBasicMaterial({color: hex, linewidth: 30});
        let curveObject = new THREE.Line(geometry, material);

        //combine
        curveObject.add(arrowHelper);
        return curveObject;
    }

    addArrow(node: node, settings: renderSettings): void {

        //TODO

        //if (node.attributes && node.attributes[settings.heightKey]) {

            let x: number = node.x0 - settings.mapSize * 0.5;
            let y: number = node.z0;
            let z: number = node.y0 - settings.mapSize * 0.5;

            let w: number = node.width;
            let h: number = node.height;
            let l: number = node.length;

            var curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(-100, 0, 0),
                new THREE.Vector3(-50, 150, 0),
                new THREE.Vector3(200, 150, 0),
                new THREE.Vector3(100, 0, 0)
            );



            let arrow: THREE.Object3D = this.makeArrowFromBezier(curve);//this.makeText(node.name + ": " + node.attributes[settings.heightKey], 30);
            //label.sprite.position.set(x + w / 2, y + 60 + h + label.heightValue / 2, z + l / 2);

            this.parentObjectInScene.add(arrow);
            this.arrows.push(arrow);

        //}

    }

    scale(x: number, y: number, z: number) {
        //for(let label of this.labels) {
        //    label.sprite.position.x *= x;
        //    label.sprite.position.y *= y;
        //    label.sprite.position.z *= z;
//
        //    //cast is a workaround for the compiler. Attribute vertices does exist on geometry
        //    //but it is missing in the mapping file for TypeScript.
        //    (<any>label.line!.geometry).vertices[0].x *= x;
        //    (<any>label.line!.geometry).vertices[0].y *= y;
        //    (<any>label.line!.geometry).vertices[0].z *= z;
//
        //    (<any>label.line!.geometry).vertices[1].x = label.sprite.position.x;
        //    (<any>label.line!.geometry).vertices[1].y = label.sprite.position.y;
        //    (<any>label.line!.geometry).vertices[1].z = label.sprite.position.z;
        //}
    }

}