const SVG_MIME_TYPE = "image/svg+xml"
const FORBIDDEN_ELEMENTS = ["script", "foreignObject"]
const REFERENCE_ATTRIBUTES = ["href", "xlink:href"]

export type ShapeMask = { dataUri: string } | { rejection: string }

/**
 * Turns an uploaded SVG into a mask the word cloud can be laid out inside. Echarts reads the mask's
 * pixels back off a canvas, and every way that read can fail — a file that is not an SVG, one that
 * taints the canvas, one the browser cannot size — fails silently and simply leaves the cloud round.
 * So each of them is refused here, with the reason to show the reader.
 */
export function shapeMaskFromSvg(svgText: string): ShapeMask {
    const document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE)
    const root = document.documentElement
    if (document.querySelector("parsererror") || root.localName !== "svg") {
        return { rejection: "That file is not an SVG." }
    }

    const forbiddenElement = FORBIDDEN_ELEMENTS.find(name => root.getElementsByTagName(name).length > 0)
    if (forbiddenElement) {
        return { rejection: `An SVG carrying a <${forbiddenElement}> cannot be used as a shape.` }
    }
    if (referencesAnotherFile(root)) {
        return { rejection: "An SVG that references another file cannot be used as a shape." }
    }

    const sized = withIntrinsicSize(root)
    if (!sized) {
        return { rejection: "That SVG states neither a size nor a viewBox, so it has no shape to fill." }
    }
    return { dataUri: `data:${SVG_MIME_TYPE},${encodeURIComponent(new XMLSerializer().serializeToString(sized))}` }
}

/** A reference into the document itself is a gradient or a clip path; anything else is another file,
 * and drawing it taints the canvas the mask is read from. */
function referencesAnotherFile(root: Element): boolean {
    return [root, ...root.querySelectorAll("*")].some(element =>
        REFERENCE_ATTRIBUTES.some(attribute => {
            const reference = element.getAttribute(attribute)
            return reference !== null && !reference.startsWith("#")
        })
    )
}

/** An SVG without width and height is drawn at the browser's default size rather than its own, which
 * reads as a mask of the wrong shape. The viewBox states the shape's own size, so it stands in. */
function withIntrinsicSize(root: Element): Element | null {
    if (root.getAttribute("width") && root.getAttribute("height")) {
        return root
    }
    const viewBox = root
        .getAttribute("viewBox")
        ?.split(/[\s,]+/)
        .filter(Boolean)
    if (viewBox?.length !== 4) {
        return null
    }
    const [, , width, height] = viewBox
    root.setAttribute("width", width)
    root.setAttribute("height", height)
    return root
}
