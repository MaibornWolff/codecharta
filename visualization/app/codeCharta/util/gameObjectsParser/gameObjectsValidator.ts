import Ajv from "ajv"
import gameObjectsSchema from "./gameObjectsSchema.json"

export function validateGameObjects(jsonContent: string) {
    const ajv = new Ajv({ allErrors: true })
    return ajv.validate(gameObjectsSchema, JSON.parse(jsonContent))
}
