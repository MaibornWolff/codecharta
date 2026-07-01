import { createSelector } from "@ngrx/store"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"

/**
 * Node-side attribute maps OWNED by the metrics lens.
 *
 * `attributeTypes` is split into `{ nodes, edges }`, so the lens owns the node projection and leaves the
 * edge side for the future dependency lens. `attributeDescriptors` is a flat metric->descriptor map with
 * no node/edge split, so the lens's node-descriptor source is that map as-is.
 *
 * Both still read the `fileSettings` state selectors — a documented lens->legacy bridge (warn) that flips
 * once the attribute state moves to the FileStore in a later slice. Owning the selectors here means lens
 * code and the lens facade no longer reference the raw `state/` selector paths directly.
 */
export const nodeAttributeDescriptorsSelector = attributeDescriptorsSelector

export const nodeAttributeTypesSelector = createSelector(
    attributeTypesSelector,
    (attributeTypes): { [key: string]: AttributeTypeValue } => attributeTypes.nodes ?? {}
)
