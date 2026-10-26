# Known gaps: C++

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-member-of-type

`SpeedType::WALKING` in an initializer expression is not reported as a use.

```text
missing file mover.hpp -> speed.hpp
missing leaf mover.hpp#Mover -> speed.hpp#SpeedType
```

## spec-template-out-of-line-member

An out-of-line member of a template is a declaration named `Pool<T>`, not part of `Pool`, and does not use `Pool`.

```text
missing file pool_impl.hpp -> pool.hpp
missing leaf pool_impl.hpp#Pool -> counter.hpp#Counter
missing leaf pool_impl.hpp#Pool -> pool.hpp#Pool
extra leaf pool_impl.hpp#Pool<T> -> counter.hpp#Counter
```

## spec-template-specialization

An explicit specialization is no declaration.

```text
missing file centaur_repository.hpp -> centaur.hpp
missing file centaur_repository.hpp -> repository.hpp
missing leaf centaur_repository.hpp#Repository -> centaur.hpp#Centaur
missing leaf centaur_repository.hpp#Repository -> repository.hpp#Repository
```
