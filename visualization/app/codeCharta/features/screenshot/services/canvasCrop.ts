import type { Rectangle } from "../../../renderer/dependencyGraph/dependencyGraphRegistry.facade"

export function cropTransparentMargins(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const width = canvas.width
    const height = canvas.height
    const data = canvas.getContext("2d").getImageData(0, 0, width, height).data

    let minX = width
    let minY = height
    let maxX = 0
    let maxY = 0

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const alpha = data[(width * y + x) * 4 + 3]
            if (alpha > 0) {
                minX = Math.min(minX, x)
                maxX = Math.max(maxX, x)
                minY = Math.min(minY, y)
                maxY = Math.max(maxY, y)
            }
        }
    }

    if (minX > maxX || minY > maxY) {
        return canvas
    }

    return cropToRectangle(canvas, { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
}

export function cropToRectangle(canvas: HTMLCanvasElement, { x, y, width, height }: Rectangle): HTMLCanvasElement {
    const croppedCanvas = document.createElement("canvas")
    croppedCanvas.width = width
    croppedCanvas.height = height
    croppedCanvas.getContext("2d").drawImage(canvas, x, y, width, height, 0, 0, width, height)
    return croppedCanvas
}
