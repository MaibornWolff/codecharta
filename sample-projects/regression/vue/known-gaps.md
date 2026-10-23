# Known gaps: Vue

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-auto-import-unique

A tag finds a component only in the own folder.

```text
missing file views/Home.vue -> components/Badge.vue
missing leaf views/Home.vue#Home -> components/Badge.vue#Badge
```

## spec-binding-over-auto-import

A default import of a `.vue` file does not name its component, so neither the tag nor the import finds it.

```text
missing file views/Home.vue -> b/Badge.vue
missing leaf views/Home.vue#Home -> b/Badge.vue#Badge
```

## spec-component-file-name

A default import of a `.vue` file does not name its component.

```text
missing file main.ts -> components/Button.vue
missing leaf main.ts#root -> components/Button.vue#Button
```

## spec-components-option

A default import of a `.vue` file does not name its component, and top-level code is no declaration.

```text
missing file main.ts -> components/other/CreatureCard.vue
missing file views/CreatureList.vue -> components/CreatureCard.vue
missing leaf main.ts#main.script -> components/other/CreatureCard.vue#CreatureCard
missing leaf main.ts#main.script -> main.ts#app
missing leaf views/CreatureList.vue#CreatureList -> components/CreatureCard.vue#CreatureCard
```

## spec-global-registration

A global registration is not read, and top-level code is no declaration.

```text
missing file main.ts -> components/CreatureBadge.vue
missing file views/Panel.vue -> components/CreatureBadge.vue
missing leaf main.ts#main.script -> components/CreatureBadge.vue#CreatureBadge
missing leaf views/Panel.vue#Panel -> components/CreatureBadge.vue#CreatureBadge
```

## spec-plain-script-export

A named export of a plain script block is no declaration.

```text
missing file use.ts -> components/Comp.vue
missing leaf components/Comp.vue#Comp -> components/Comp.vue#Props
missing leaf use.ts#size -> components/Comp.vue#Props
```

## spec-template-expression

Every import of a script block counts as a use.

```text
extra leaf components/Item.vue#Item -> fmt.ts#unused
```
