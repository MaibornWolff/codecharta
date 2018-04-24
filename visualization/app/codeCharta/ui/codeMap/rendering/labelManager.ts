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

    addLabel(node : node, settings : renderSettings) : void {
        if(node.attributes && node.attributes[settings.heightKey]){

            let x : number = node.x0 - settings.mapSize * 0.5;
            let y : number = node.z0;
            let z : number = node.y0 - settings.mapSize * 0.5;

            let w : number = node.width;
            let h : number = node.height;
            let l : number = node.length;

            let label : internalLabel = this.makeText(node.name + ": " + node.attributes[settings.heightKey], 30);
            label.sprite.position.set(x+w/2,y+60+h + label.heightValue/2,z+l/2);

            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
        
            const geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(x + w / 2, y + h, z + l / 2),
                new THREE.Vector3(x + w / 2, y + h + 60, z + l / 2)
            );
        
            label.line = new THREE.Line(geometry, material);

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
        
    scale(x : number, y : number, z : number) {
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
        
    /**
    * Returns a text sprite
    * @param {string} message
    * @param {number} fontsize
    * @returns {THREE.Sprite}
    */
    private makeText(message : string, fontsize : number) : internalLabel {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx!.font = fontsize + "px Arial";
    
        const margin = 10;
    
        // setting canvas width/height before ctx draw, else canvas is empty
        const w = ctx!.measureText(message).width;
        const h = fontsize;
        canvas.width = w + margin;
        canvas.height = h + margin; // fontsize * 1.5
        
        //bg
        ctx!.fillStyle = "rgba(255,255,255,1)";
        ctx!.strokeStyle = "rgba(0,0,255,1)";
        ctx!.fillRect(0,0,canvas.width, canvas.height);
        ctx!.strokeRect(0,0,canvas.width, canvas.height);
        
        // after setting the canvas width/height we have to re-set font to apply!?! looks like ctx reset
        ctx!.font = h + "px Arial";
        ctx!.fillStyle = "rgba(0,0,0,1)";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(message, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter; // NearestFilter;
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({map : texture});
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(canvas.width,canvas.height,1);

        return {
            "sprite" : sprite,
            "heightValue" : canvas.height,
            "line" : null
        };
    }
}