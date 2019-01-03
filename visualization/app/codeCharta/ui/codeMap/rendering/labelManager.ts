import * as THREE from "three";
import {node} from "./node";
import {AngularColors, renderSettings} from "./renderSettings";
import {CameraChangeSubscriber, ThreeOrbitControlsService} from "../threeViewer/threeOrbitControlsService";
import {PerspectiveCamera, Sprite} from "three";
import {Group} from "three";

interface internalLabel {
    sprite : THREE.Sprite;
    line : THREE.Line | null;
    heightValue : number;
}

export class LabelManager implements CameraChangeSubscriber {
    private parentObjectInScene : THREE.Object3D;
    private labels : internalLabel[];
    private LABEL_WIDTH_DIVISOR: number = 2600; // empirically gathered
    private LABEL_HEIGHT_DIVISOR: number = 50; // empirically gathered
    private camera: PerspectiveCamera;
    private mapGeometry: Group;

    constructor(parentObjectInScene: THREE.Object3D,
                threeOrbitControlsService: ThreeOrbitControlsService,
                camera: PerspectiveCamera,
                mapGeometry: Group) {

        this.parentObjectInScene = parentObjectInScene;
        this.labels = new Array<internalLabel>();
        this.camera = camera;
        this.mapGeometry = mapGeometry;
        threeOrbitControlsService.subscribe(this);
    }

    addLabel(node: node, settings: renderSettings) : void {
        if(node.attributes && node.attributes[settings.heightKey]){

            const x: number = node.x0 - settings.mapSize * 0.5;
            const y: number = node.z0;
            const z: number = node.y0 - settings.mapSize * 0.5;

            const labelX: number = x + node.width / 2;
            const labelY: number = y + node.height;
            const labelZ: number = z + node.length / 2;

            let label : internalLabel = this.makeText(node.name + ": " + node.attributes[settings.heightKey], 30);
            label.sprite.position.set(labelX,labelY + 60 + label.heightValue / 2,labelZ);
            label.line = this.makeLine(labelX, labelY, labelZ);

            this.parentObjectInScene.add(label.sprite);
            this.parentObjectInScene.add(label.line);

            this.labels.push(label);
        }
    }

    clearLabels() {
        this.labels = [];
        while (this.parentObjectInScene.children.length > 0) {
            this.parentObjectInScene.children.pop();
        }
    }

    scale(x: number, y: number, z: number) {
        for(let label of this.labels) {
            label.sprite.position.x *= x;
            label.sprite.position.y *= y;
            label.sprite.position.z *= z;

            //cast is a workaround for the compiler. Attribute vertices does exist on geometry
            //but it is missing in the mapping file for TypeScript.
            (<any>label.line!.geometry).vertices[0].x *= x;
            (<any>label.line!.geometry).vertices[0].y *= y;
            (<any>label.line!.geometry).vertices[0].z *= z;

            (<any>label.line!.geometry).vertices[1].x = label.sprite.position.x;
            (<any>label.line!.geometry).vertices[1].y = label.sprite.position.y;
            (<any>label.line!.geometry).vertices[1].z = label.sprite.position.z;
        }
    }

    onCameraChanged(camera: PerspectiveCamera, event: angular.IAngularEvent) {
        for (let label of this.labels) {
            this.setLabelSize(label.sprite);
        }
    }

    private makeText(message: string, fontsize: number) : internalLabel {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx!.font = fontsize + "px Helvetica Neue";
    
        const margin = 20;
    
        // setting canvas width/height before ctx draw, else canvas is empty
        canvas.width = ctx!.measureText(message).width + margin;
        canvas.height = fontsize + margin;
        
        //bg
        ctx!.fillStyle = "rgba(255,255,255,1)";
        ctx!.strokeStyle = AngularColors.green;
        ctx!.lineJoin = "round";
        ctx!.lineCap = "round";
        ctx!.lineWidth = 5;
        ctx!.fillRect(0,0, canvas.width, canvas.height);
        ctx!.strokeRect(0,0, canvas.width, canvas.height);
        
        // after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
        ctx!.font = fontsize + "px Helvetica Neue";
        ctx!.fillStyle = "rgba(0,0,0,1)";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(message, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter; // NearestFilter;
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({map : texture});
        const sprite = new THREE.Sprite(spriteMaterial);
        this.setLabelSize(sprite, canvas.width);

        return {
            sprite: sprite,
            heightValue: canvas.height,
            line: null
        };
    }

    private setLabelSize(sprite: Sprite, currentLabelWidth: number = undefined) {
        const distance = this.camera.position.distanceTo(this.mapGeometry.position);
        currentLabelWidth = (!currentLabelWidth) ? sprite.material.map.image.width : currentLabelWidth;
        sprite.scale.set(distance / this.LABEL_WIDTH_DIVISOR * currentLabelWidth,distance / this.LABEL_HEIGHT_DIVISOR,1);
    }

    private makeLine(x: number, y: number, z: number): THREE.Line {
        const material = new THREE.LineBasicMaterial({
            color: AngularColors.green,
            linewidth: 2
        });

        const geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x, y + 60, z)
        );

        return new THREE.Line(geometry, material);
    }
}