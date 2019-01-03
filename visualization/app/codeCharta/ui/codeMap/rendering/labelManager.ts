import * as THREE from "three";
import {node} from "./node";
import {renderSettings} from "./renderSettings";

interface internalLabel {
    sprite : THREE.Sprite;
    line : THREE.Line | null;
    heightValue : number;
}

export class LabelManager {
    private parentObjectInScene : THREE.Object3D;
    private labels : internalLabel[];

    constructor(argParentObjectInScene : THREE.Object3D) {
        this.parentObjectInScene = argParentObjectInScene;
        this.labels = new Array<internalLabel>();
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
        ctx!.strokeStyle = "rgba(0,0,255,1)";
        ctx!.lineJoin = "round";
        ctx!.lineCap = "round";
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
        sprite.scale.set(canvas.width, canvas.height, 1);

        return {
            sprite: sprite,
            heightValue: canvas.height,
            line: null
        };
    }

    private makeLine(x: number, y: number, z: number): THREE.Line {
        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
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