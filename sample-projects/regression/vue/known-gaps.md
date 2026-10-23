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

## spec-components-option

A tag is not looked up in the `components` option.

```text
missing file views/CreatureList.vue -> components/CreatureCard.vue
missing leaf views/CreatureList.vue#CreatureList -> components/CreatureCard.vue#CreatureCard
```

## spec-global-registration

A global registration is not read.

```text
missing file views/Panel.vue -> components/CreatureBadge.vue
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
