import * as THREE from "three";
import {Node} from "./node";
import {ColorService} from "../../../core/colorService";

export class RenderingUtil {


    public static getMaxNodeDepth(nodes: Node[]): number {
        let max = 0;
        nodes.forEach((node)=>{
            max = Math.max(node.depth, max);
        });
        return max;
    }

    public static colorToVec3(color : string) : THREE.Vector3
    {
        const convertedColor = ColorService.convertHexToNumber(color);

        return new THREE.Vector3(
            ((convertedColor  >> 16) & 0xFF) / 255.0,
            ((convertedColor >> 8) & 0xFF) / 255.0,
            (convertedColor & 0xFF) / 255.0
        );
    }

    public static rgbToHexNumber(r: number, g: number, b: number):number  {
        return parseInt(Math.round(r).toString(16) + '' + Math.round(g).toString(16) + '' + Math.round(b).toString(16), 16);
    }


    public static gradient(startColor: string, endColor: string, steps: number): number[] {
        let start = {
            'Hex'   : startColor,
            'R'     : parseInt(startColor.slice(1,3), 16),
            'G'     : parseInt(startColor.slice(3,5), 16),
            'B'     : parseInt(startColor.slice(5,7), 16)
        };
        let end = {
            'Hex'   : endColor,
            'R'     : parseInt(endColor.slice(1,3), 16),
            'G'     : parseInt(endColor.slice(3,5), 16),
            'B'     : parseInt(endColor.slice(5,7), 16)
        };
        let diffR = end['R'] - start['R'];
        let diffG = end['G'] - start['G'];
        let diffB = end['B'] - start['B'];

        let stepsHex  = [];
        let stepsR    = [];
        let stepsG    = [];
        let stepsB    = [];

        for(let i = 0; i <= steps; i++) {
            stepsR[i] = start['R'] + ((diffR / steps) * i);
            stepsG[i] = start['G'] + ((diffG / steps) * i);
            stepsB[i] = start['B'] + ((diffB / steps) * i);
            stepsHex[i] = parseInt(Math.round(stepsR[i]).toString(16) + '' + Math.round(stepsG[i]).toString(16) + '' + Math.round(stepsB[i]).toString(16), 16);
        }
        return stepsHex;

    }
}
