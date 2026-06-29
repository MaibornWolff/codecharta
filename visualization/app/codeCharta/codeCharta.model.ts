// Barrel for the model types. The definitions live in ./model/domain.model (the
// leaf .cc.json domain) and ./model/state.model (the ngrx state tree, which
// builds on the domain). New code may import directly from those files; this
// barrel keeps existing `from "…/codeCharta.model"` imports working during the
// incremental migration.
export * from "./model/domain.model"
export * from "./model/state.model"
