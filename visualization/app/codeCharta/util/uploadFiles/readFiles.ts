import { parseGameObjectsFile } from "../gameObjectsParser/gameObjectsImporter"
import { validateGameObjects } from "../gameObjectsParser/gameObjectsValidator"
import { ungzip } from "pako"

export const readFiles = (files: FileList): Promise<string>[] => {
	const readFilesPromises = []
	// eslint-disable-next-line unicorn/no-for-loop -- FileList is not iterable, therefore we cannot use for-of loop
	for (let index = 0; index < files.length; index++) {
		readFilesPromises.push(readFile(files[index]))
	}
	return readFilesPromises
}

const readFile = async (file: File): Promise<string> =>
	new Promise(resolve => {
		const isCompressed = file.name.endsWith(".gz")
		const reader = new FileReader()
		if (isCompressed) {
			reader.readAsArrayBuffer(file)
		} else {
			reader.readAsText(file, "UTF-8")
		}

		let content: string

		reader.onload = event => {
			const result = event.target.result.toString()
			content = isCompressed ? ungzip(event.target.result, { to: "string" }) : result
			if (result.includes("gameObjectPositions") && validateGameObjects(result)) {
				content = JSON.stringify(parseGameObjectsFile(result))
			}
		}

		reader.onloadend = () => {
			resolve(content)
		}
	})
