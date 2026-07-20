/**
 * WRITE surface of the domainLensSource state home — the seed action the load pipeline dispatches to
 * populate the cc.json domain lens word bank on file load. Kept separate from the read facade so a
 * read-only consumer physically cannot dispatch. External access only via this facade (stores-own-ccjson-source).
 */
export { setDomainWords } from "./store/words/words.actions"
