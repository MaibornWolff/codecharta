/**
 * WRITE surface of the dependencyLensSource state home — the seed action the load pipeline dispatches to
 * populate the cc.json edge attribute types on file load. Kept separate from the read facade so a
 * read-only consumer physically cannot dispatch. External access only via this facade (stores-own-ccjson-source).
 */
export { setEdgeAttributeTypes } from "./store/attributeTypes/attributeTypes.actions"
