const MAIBORNWOLFF_M_MASK_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="563" viewBox="58.7 0 64 56.3">' +
    '<path fill="#000" d="M81.9,20.3h0c0-6.9,3.5-13,8.8-16.7C87.4,1.3,83.4,0,79.1,0,67.9,0,58.8,9.1,58.7,20.3h0v36h17.6V20.4h0c0-1.5,1.2-2.8,2.8-2.8s2.8,1.2,2.8,2.8h0Z"/>' +
    '<path fill="#000" d="M122.7,20.3c0-11.2-9.2-20.3-20.4-20.3s-20.3,9.1-20.4,20.3h0v36h17.6V20.4h0c0-1.1.6-2.1,1.6-2.5,2-.9,4,.6,4,2.5h0v35.9h17.6V20.3h0Z"/>' +
    "</svg>"

export const WORD_CLOUD_M_MASK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(MAIBORNWOLFF_M_MASK_SVG)}`

export function loadWordCloudMaskImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        if (typeof Image === "undefined") {
            reject(new Error("Image is not available in this environment"))
            return
        }
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Failed to load the word-cloud mask image"))
        image.src = WORD_CLOUD_M_MASK_DATA_URI
    })
}
