const MAX_ATTEMPTS = 30

/**
 * Centres the tree row for `path` once it exists in the DOM.
 *
 * Revealing a node opens its ancestors, and each level opens in its own change-detection pass, so the
 * target row is generally NOT rendered yet in the frame the reveal is requested — a single
 * requestAnimationFrame misses it and the row silently never scrolls. Retry across frames instead,
 * bounded so a path that never renders (excluded, or filtered out by a search) cannot spin forever.
 */
export function scrollRowIntoViewWhenRendered(path: string, isStillRequested: () => boolean = () => true) {
    let attemptsLeft = MAX_ATTEMPTS

    const attempt = () => {
        if (!isStillRequested()) {
            return
        }
        const row = document.getElementById(path)
        if (row) {
            row.scrollIntoView({ block: "center" })
            return
        }
        attemptsLeft -= 1
        if (attemptsLeft > 0) {
            requestAnimationFrame(attempt)
        }
    }

    requestAnimationFrame(attempt)
}
