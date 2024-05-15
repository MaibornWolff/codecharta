export const createCCFileInput = () => {
    const fileInput = document.createElement("INPUT") as HTMLInputElement
    fileInput.setAttribute("type", "file")
    fileInput.setAttribute("accept", ".json,.gz")
    fileInput.setAttribute("multiple", "")
    document.body.appendChild(fileInput)
    return fileInput
}
