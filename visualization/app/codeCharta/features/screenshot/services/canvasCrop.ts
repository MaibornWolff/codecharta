/**
 * Trims the fully transparent margins off a canvas, so a screenshot is the picture and nothing else —
 * both captures draw onto a transparent surface that is as large as the viewport (or the cloud's
 * container), and the drawn content rarely fills it.
 *
 * A canvas without a single opaque pixel is returned untouched: there is no content to frame, and the
 * cropped box would come out empty.
 */
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

    const croppedCanvas = document.createElement("canvas")
    croppedCanvas.width = maxX - minX + 1
    croppedCanvas.height = maxY - minY + 1

    croppedCanvas
        .getContext("2d")
        .drawImage(canvas, minX, minY, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height)

    return croppedCanvas
}
