export interface CloudViewport {
    scale: number
    x: number
    y: number
}

export interface CloudPoint {
    x: number
    y: number
}

export interface CloudSize {
    width: number
    height: number
}

export const WHOLE_CLOUD: CloudViewport = { scale: 1, x: 0, y: 0 }
export const MAX_CLOUD_SCALE = 8
export const ZOOM_STEP = 1.2

export function isWholeCloud(viewport: CloudViewport): boolean {
    return viewport.scale === WHOLE_CLOUD.scale
}

/** Zooms so the point under the pointer stays under it. */
export function zoomAt(viewport: CloudViewport, pointer: CloudPoint, factor: number, size: CloudSize): CloudViewport {
    const scale = Math.min(MAX_CLOUD_SCALE, Math.max(WHOLE_CLOUD.scale, viewport.scale * factor))
    const appliedFactor = scale / viewport.scale
    return keepCloudInSight(
        {
            scale,
            x: pointer.x - (pointer.x - viewport.x) * appliedFactor,
            y: pointer.y - (pointer.y - viewport.y) * appliedFactor
        },
        size
    )
}

export function panBy(viewport: CloudViewport, delta: CloudPoint, size: CloudSize): CloudViewport {
    return keepCloudInSight({ ...viewport, x: viewport.x + delta.x, y: viewport.y + delta.y }, size)
}

/** The magnified canvas always covers the container, so the whole cloud leaves no room to pan. */
export function keepCloudInSight(viewport: CloudViewport, size: CloudSize): CloudViewport {
    return {
        scale: viewport.scale,
        x: clampOffset(viewport.x, size.width, viewport.scale),
        y: clampOffset(viewport.y, size.height, viewport.scale)
    }
}

function clampOffset(offset: number, length: number, scale: number): number {
    const furthestOffset = length * (1 - scale)
    return Math.min(0, Math.max(furthestOffset, offset))
}
