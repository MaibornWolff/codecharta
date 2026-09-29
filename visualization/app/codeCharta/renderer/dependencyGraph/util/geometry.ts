import { maxOf, minOf } from "./collections"

export type Point = [number, number]

export interface Rectangle {
    x: number
    y: number
    width: number
    height: number
}

const NOTHING_TO_ENCLOSE: Rectangle = { x: 0, y: 0, width: 0, height: 0 }

export function intersects(rectangleA: Rectangle, rectangleB: Rectangle): boolean {
    return (
        rectangleA.x < rectangleB.x + rectangleB.width &&
        rectangleB.x < rectangleA.x + rectangleA.width &&
        rectangleA.y < rectangleB.y + rectangleB.height &&
        rectangleB.y < rectangleA.y + rectangleA.height
    )
}

export function enclosingRectangle(rectangles: readonly Rectangle[]): Rectangle {
    if (rectangles.length === 0) {
        return NOTHING_TO_ENCLOSE
    }
    const left = minOf(rectangles.map(rectangle => rectangle.x))
    const top = minOf(rectangles.map(rectangle => rectangle.y))
    const right = maxOf(rectangles.map(rectangle => rectangle.x + rectangle.width))
    const bottom = maxOf(rectangles.map(rectangle => rectangle.y + rectangle.height))
    return { x: left, y: top, width: right - left, height: bottom - top }
}
