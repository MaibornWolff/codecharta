import { Vector2 } from "three"

export default class Rectangle {
	public topLeft: Vector2
	public width: number
	public height: number
	public bottomRight : Vector2

	constructor(topLeft: Vector2, width: number, height: number) {
		this.topLeft = topLeft
		this.bottomRight = topLeft.clone().add(new Vector2(width,height))
		this.width = width
		this.height = height
	}

	// TODO rename
	public shorterSide(): number {
		return this.width > this.height ? this.height : this.width
	}

	public isVertical(): boolean {
		return this.height > this.width
	}

	public area(): number {
		return this.width * this.height
	}

	public getBottomRight(): Vector2 {
		return this.bottomRight
	}
}
