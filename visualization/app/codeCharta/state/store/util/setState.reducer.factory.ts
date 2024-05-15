/**
 * Most of CodeCharta's action will reset when action's payload is undefined.
 * E.g., this has currently an effect when applying a scenario without map colors,
 * to ensure that it will have default colors.
 */

import { Action } from "@ngrx/store"

export const setState =
    <T>(defaultValue: T) =>
    (_state: T, action: Action & { value: T }) =>
        action.value === undefined ? defaultValue : action.value

export const mergeState =
    <T>(defaultValue: T) =>
    (state: T, action: Action & { value: Partial<T> }): T =>
        action.value === undefined ? defaultValue : { ...state, ...action.value }
