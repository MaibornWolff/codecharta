import { focusNode, setAllFocusedNodes, unfocusAllNodes, unfocusNode } from "./focusedNodePath.actions"
import { fileRoot } from "../../../../services/loadFile/fileRoot"
import { createReducer, on } from "@ngrx/store"

export const defaultFocusedNodePath: string[] = []
export const focusedNodePath = createReducer(
    defaultFocusedNodePath,
    on(setAllFocusedNodes, (_state, action) => [...action.value]),
    on(unfocusAllNodes, () => []),
    on(focusNode, (state, action) => {
        if (action.value === fileRoot.rootPath) {
            return state
        }
        if (isChildPath(action.value, state[0])) {
            return [action.value, ...state]
        }
        return [action.value]
    }),
    on(unfocusNode, state => state.slice(1))
)

function normalizePath(inputPath: string): string {
    if (!inputPath) {
        return
    }
    const parts = inputPath.split("/").reduce<string[]>((accumulator, part) => {
        if (part === "" || part === ".") {
            return accumulator
        }
        if (part === "..") {
            accumulator.pop()
        } else {
            accumulator.push(part)
        }
        return accumulator
    }, [])

    return `/${parts.join("/")}`
}

function isChildPath(potentialChild: string, potentialParent: string): boolean {
    if (!potentialChild || !potentialParent) {
        return false
    }

    const normalizedChild = normalizePath(potentialChild)
    const normalizedParent = normalizePath(potentialParent)
    const parentPathWithSlash = normalizedParent.endsWith("/") ? normalizedParent : `${normalizedParent}/`

    return normalizedChild.startsWith(parentPathWithSlash)
}
