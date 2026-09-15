import Ajv from "ajv"
import { GameObjectsFile } from "./gameObjectsImporter"
import gameObjectsSchema from "./gameObjectsSchema.json"

export function validateGameObjects(content: unknown): content is GameObjectsFile {
    const ajv = new Ajv({ allErrors: true, strict: false })
    return ajv.validate(gameObjectsSchema, content)
}
