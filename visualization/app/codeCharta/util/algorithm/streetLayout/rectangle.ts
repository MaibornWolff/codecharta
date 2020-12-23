import { Vector2 } from "three"

export default class Rectangle {
	topLeft: Vector2
	width: number
	height: number
	private bottomRight: Vector2

	constructor(topLeft: Vector2, width: number, height: number) {
		this.topLeft = topLeft
		this.bottomRight = topLeft.clone().add(new Vector2(width, height))
		this.width = width
		this.height = height
	}

	// TODO rename
	shorterSide(): number {
		return this.width > this.height ? this.height : this.width
	}

	isVertical(): boolean {
		return this.height > this.width
	}

	area(): number {
		return this.width * this.height
	}

	getBottomRight(): Vector2 {
		return this.bottomRight
	}
}
