const MAX_FRAMES_TO_WAIT_FOR_ROW = 30

export function scrollRowIntoViewWhenRendered(path: string, isStillRequested: () => boolean = () => true) {
    let framesLeft = MAX_FRAMES_TO_WAIT_FOR_ROW

    const scrollOrRetryNextFrame = () => {
        if (!isStillRequested()) {
            return
        }
        const row = document.getElementById(path)
        if (row) {
            row.scrollIntoView({ block: "center" })
            return
        }
        framesLeft -= 1
        if (framesLeft > 0) {
            requestAnimationFrame(scrollOrRetryNextFrame)
        }
    }

    requestAnimationFrame(scrollOrRetryNextFrame)
}
