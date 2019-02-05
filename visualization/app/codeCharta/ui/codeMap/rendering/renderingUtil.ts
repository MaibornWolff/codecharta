import * as THREE from "three"
import { node } from "./node"

export class renderingUtil {
	static getMaxNodeDepth(nodes: node[]): number {
		let max = 0
		nodes.forEach(node => {
			max = Math.max(node.depth, max)
		})
		return max
	}

	static colorToVec3(color: number): THREE.Vector3 {
		return new THREE.Vector3(((color >> 16) & 0xff) / 255.0, ((color >> 8) & 0xff) / 255.0, (color & 0xff) / 255.0)
	}

	static rgbToHexNumber(r: number, g: number, b: number): number {
		return parseInt(Math.round(r).toString(16) + "" + Math.round(g).toString(16) + "" + Math.round(b).toString(16), 16)
	}

	static gradient(startColor: string, endColor: string, steps: number): number[] {
		let start = {
			Hex: startColor,
			R: parseInt(startColor.slice(1, 3), 16),
			G: parseInt(startColor.slice(3, 5), 16),
			B: parseInt(startColor.slice(5, 7), 16)
		}
		let end = {
			Hex: endColor,
			R: parseInt(endColor.slice(1, 3), 16),
			G: parseInt(endColor.slice(3, 5), 16),
			B: parseInt(endColor.slice(5, 7), 16)
		}
		let diffR = end["R"] - start["R"]
		let diffG = end["G"] - start["G"]
		let diffB = end["B"] - start["B"]

		let stepsHex = []
		let stepsR = []
		let stepsG = []
		let stepsB = []

		for (let i = 0; i <= steps; i++) {
			stepsR[i] = start["R"] + (diffR / steps) * i
			stepsG[i] = start["G"] + (diffG / steps) * i
			stepsB[i] = start["B"] + (diffB / steps) * i
			stepsHex[i] = parseInt(
				Math.round(stepsR[i]).toString(16) + "" + Math.round(stepsG[i]).toString(16) + "" + Math.round(stepsB[i]).toString(16),
				16
			)
		}
		return stepsHex
	}
}
