/**
 * The labelSettings feature has no effects left: UpdateVisibleTopLabelsEffect was subsumed by the
 * post-load reconciliation sequence (load/effects/reconcileAfterLoad), which lowers the top-label
 * count as step 5 of the load sequence rather than racing the file selector for it.
 */
export const labelSettingsEffects = []
