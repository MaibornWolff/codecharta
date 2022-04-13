export const createCCFileInput = () => {
	const fileInput = document.createElement("INPUT") as HTMLInputElement
	fileInput.type = "file"
	fileInput.accept = ".json,.gz"
	fileInput.multiple = true
	return fileInput
}
