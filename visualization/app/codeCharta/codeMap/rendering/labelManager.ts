import * as THREE from "three";
import {node} from "./node"

interface internalLabel {
    sprite : THREE.Sprite,
    line : THREE.Line | null,
    heightValue : number
}

export class labelManager {
    private parentObjectInScene : THREE.Object3D;
    private labels : internalLabel[];

    constructor(argParentObjectInScene : THREE.Object3D) {
        this.parentObjectInScene = argParentObjectInScene;
        this.labels = new Array<internalLabel>();
    }

    /**
    * adds a label at the given position
    * @param {number} x x position
    * @param {number} y y position
    * @param {number} z z position
    * @param {number} w width
    * @param {number} h height
    * @param {number} l length
    * @param {object} node the transformed d3 node
    * @param {string} heightKey the height metric
    * @param {Object3D} building the building
    */
    addLabel(node : node, heightKey : number, mapSize : number) : void {
        if(node.attributes && node.attributes[heightKey]){

            let x : number = node.x0 - mapSize * 0.5;
            let y : number = node.z0;
            let z : number = node.y0 - mapSize * 0.5;

            let w : number = node.width;
            let h : number = node.height;
            let l : number = node.length;

            let label : internalLabel = this.makeText(node.name + ": " + node.attributes[heightKey], 30);
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
        
    /**
     * Repositions labels and connectors according to building and floor scale
     * @param {number} x scaling x
     * @param {number} y scaling y
     * @param {number} z scaling z
     */
    scale(x : number, y : number, z : number) {
        for(let label of this.labels) {
            label.sprite.position.x *= x;
            label.sprite.position.y *= y;
            label.sprite.position.z *= z;

            /*
            label.line!.geometry.vertices[0].x *= x;
            label.line!.geometry.vertices[0].y *= y;
            label.line!.geometry.vertices[0].z *= z;

            label.line!.geometry.vertices[1].x *= x;
            label.line!.geometry.vertices[1].y *= y;
            label.line!.geometry.vertices[1].z *= z;
            */
        }
    }
        
    /**
    * Returns a text sprite
    * @param {string} message
    * @param {number} fontsize
    * @returns {THREE.Sprite}
    */
    makeText(message : string, fontsize : number) : internalLabel {
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