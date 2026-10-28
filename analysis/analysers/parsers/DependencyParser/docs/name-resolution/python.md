# Name resolution: Python

Follows the Python language reference, sections "Naming and binding" (4.2), "The import system" (5) and "The import
statement" (7.11), and the import behaviour of the interpreter for regular and namespace packages. The rules shared
by every language are in [README.md](README.md).

## Declarations

- A module is a `.py` file; its logical path is its file path below the analysis root without `.py`:
  `app/models/user.py` is `app.models.user`, the `__init__.py` of a package `app.models.__init__`.
- A class, function or variable bound at the top level of a module has the module's path plus its name:
  `app.models.user.User`.
- A class nested in a class has the path of the class around it plus its name, `app.models.user.User.Address`, and
  only its own uses are its dependencies (decision 4). Methods and nested functions belong to the class or function
  around them. A class or function declared inside a function is no target: no other declaration can name it.
- A name that a package's `__init__.py` imports with `from m import N` or `from m import N as A` is a declaration of
  that `__init__.py` too, of the kind re-export, named by the name it binds; it depends on what it imports
  (decision 2).

## Import paths

An absolute module path `a.b.c` means a module of the first of these places that holds it:

1. An import root: the analysis root; every folder that holds a top-level package (a folder with `__init__.py` whose
   parent has none, such as `src/` above `src/app/__init__.py`); and the folder of the importing file. Below a root
   `R`, the package `R/a/b/c/__init__.py` comes before the module `R/a/b/c.py`; a folder without `__init__.py` is a
   namespace package, which holds submodules but no declarations. Of several roots that hold the module path, the one
   that shares the longest folder path with the importing file wins, the first in path order of equally near ones.
2. A module whose file path below the analysis root ends with the module path in whole segments, at least two of them:
   `app.core` means `svc/app/core.py`, and `util` alone means no `x/util.py`. The longest ending wins, then the nearest
   to the importing file as in 1.
3. None: a library or standard module, such as `typing`, `logging` or `requests`. A name through it draws no edge.

A relative module path starts at the package of the importing file: `from . import x` in `app/models/user.py` means
`app.models`, every further dot its parent, `from ..core import C` is `app.core`. One that leaves the analysis root
means no module.

What an import binds, in the scope it is written in:

- `import a.b.c` binds `a`, the top-level package; `a.b.c.N` then walks to module `a.b.c`.
- `import a.b.c as m` binds `m` to the module `a.b.c`.
- `from m import N` binds `N` to the name `N` of module `m`: what `m` binds at its top level under that name (for a
  package, its `__init__.py`), else the submodule `m.N`. `from m import N as A` binds `A` to the same.
- `from m import *` binds every public name of `m`: those its `__all__` lists, or without `__all__` every top-level
  name not starting with `_`.

An import binds a name and draws no edge of its own; an edge comes from a use of the name.

## A simple name `N`

Looked up in this order (LEGB); the first scope that binds `N` wins:

1. The enclosing function, then each function around it: a parameter, an assignment, a `for`, `with` or `except`
   target, a nested `def` or `class`, an import. An import there means what it imports; any other binding draws no
   edge. A use written directly in a class body first sees what that body binds before it, such as a nested class.
   A class body is no enclosing scope of the methods in it: inside a method, a nested class of the own class is only
   reachable as `Outer.Inner` or `self.Inner`.
2. The module: its top-level classes, functions, variables and imports. Of several bindings of `N` the last one in
   source order wins (decision 3):
   - a use in a function body runs when the function is called, after the module has run: the last binding of the
     whole module;
   - a use in a base class, a decorator, a default value or a class body runs when its `class` or `def` statement
     runs: the last binding before that statement;
   - an annotation is evaluated lazily (Python 3.14, and earlier with `from __future__ import annotations`), so it
     sees the last binding of the whole module;
   - bindings in different branches of one `if` or `try` statement are alternatives, of which only the run decides
     (`try: from fast import X`, `except ImportError: from slow import X`): a use that sees one of them points at
     each of them (decision 5).

   The same holds for the bindings of a function or class body.
3. A builtin (`print`, `len`, `object`, `Exception`, …): no edge.
4. None of these: no edge.

## An attribute `p.N`

- If `p` is bound to a module (by `import`, or `from a import b` where `b` is a submodule), `p.N` is the name `N` of
  that module, by the rules of `from m import N`; a longer chain `a.b.c.N` walks down the submodules.
- If `p` is a class of the project, `p.N` is its nested class `N` if it declares one, and the class `p` is then no
  dependency of its own; any other attribute of the class (a method, a class variable) is a use of the class itself.
- Otherwise `p` is a value (`self`, a parameter, a variable, a call result), and `p.N` is an attribute of its type,
  which the parser does not infer: no edge, also where `N` is the name of a project declaration.

## Probes

Each rule is tested by a probe under `sample-projects/regression/python/`. "Gap" means the parser does not follow
the rule yet; `sample-projects/regression/python/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: the file path is the logical path | `spec-module-path` | ok |
| Declarations: a module-level variable | `spec-module-variable` | ok |
| Declarations, decision 4: a nested class is a leaf of its own | `spec-nested-class` | ok |
| Declarations and 1: a class declared in a function | `spec-local-class` | ok |
| Declarations, decision 2: re-export leaf of `__init__.py` | `spec-reexport-init` | ok |
| Declarations, decision 2: a re-export under an alias | `spec-reexport-alias` | ok |
| Import paths 1: the analysis root | `spec-module-path` | ok |
| Import paths 1: the folder above a top-level package | `spec-package-root` | ok |
| Import paths 1: the nearest of several roots | `spec-nearest-root` | ok |
| Import paths 1: a namespace package | `spec-namespace-package` | ok |
| Import paths 1: the folder of the importing file | `spec-file-folder-root` | ok |
| Import paths 1: a package before a module | `spec-package-over-module` | ok |
| Import paths 2: suffix of two segments | `spec-suffix-fallback` | ok |
| Import paths 2: one segment is no suffix | `spec-suffix-two-segments` | ok |
| Import paths 3: library or standard module | `spec-library-import` | ok |
| Import paths: a relative module path | `spec-relative-import` | ok |
| Binding: `import a.b.c` | `spec-import-dotted` | ok |
| Binding: `import a.b.c as m` | `spec-import-module-alias` | ok |
| Binding: `from m import N`, N a submodule | `spec-from-import-submodule` | ok |
| Binding: `from m import N as A` | `spec-from-import-alias` | ok |
| Binding: `from m import *` | `spec-wildcard-import` | ok |
| Binding: a wildcard skips names starting with `_` | `spec-wildcard-public-only` | ok |
| Binding: a wildcard follows `__all__` | `spec-wildcard-all` | ok |
| Binding: an import alone draws no edge | `spec-unused-import` | ok |
| 1. a parameter or variable of the function | `spec-function-local-binding` | ok |
| 1. an import inside a function | `spec-function-local-import` | ok |
| 1. a class body and its methods | `spec-class-scope` | ok |
| 2, decision 3: a definition after an import | `spec-definition-after-import` | ok |
| 2, decision 3: an import after a definition | `spec-import-after-definition` | ok |
| 2, decision 3: two wildcard imports, the later wins | `spec-wildcard-last-wins` | ok |
| 2, decision 3: a base class at definition time | `spec-definition-time` | ok |
| 2, decision 3: a decorator at definition time | `spec-decorator-definition-time` | ok |
| 2, decision 3: a lazy annotation | `spec-annotation-lazy` | ok |
| 2, decision 5: alternatives in `try` and `except` | `spec-alternative-try` | ok |
| 2, decision 5: alternatives in `if` and `else`, hidden by a later binding | `spec-alternative-if` | ok |
| 3. builtin | `spec-builtin` | ok |
| 2 and 3: a module binding over a builtin | `spec-module-shadows-builtin` | ok |
| Attribute through a class | `spec-class-attribute` | ok |
| Attribute on a value | `spec-attribute-on-value` | ok |
| Shared rule 1, name scope | `spec-name-scope` | ok |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- The import roots come from the `__init__.py` files of the analysed folder: `sys.path` changes at run time, `.pth`
  files, `PYTHONPATH` and the package folders of `pyproject.toml`, `setup.cfg` or `setup.py` are not read.
- `global` and `nonlocal` statements, `del`, and an `__all__` that is computed rather than written as a list.
- A name imported onward from a module other than a package's `__init__.py` (`from app.models import datetime`).
- `importlib.import_module`, `__import__` and names in strings (`"Creature"` as a forward reference): extraction
  coverage, recorded in `sample-projects/python/FINDINGS.md`.

## Decisions

1. A module path is looked up below the import roots the `__init__.py` files define, the analysis root and the
   importing file's folder, the nearest root first; without a match, the module the path ends with in at least two
   segments (decided 2026-10-23).
2. A name a package's `__init__.py` imports is a re-export declaration of that `__init__.py`: a use through the
   package points at it, and it points at what it imports (decided 2026-10-23).
3. Of several module-level bindings of one name, the one Python itself sees wins: the last of the module for a use
   that runs later, the last before the statement for a base class, decorator, default value or class body (decided
   2026-10-23).
4. A class nested in a class is a leaf of its own, `module.Outer.Inner`, as a Java member type (decided 2026-10-23).
5. Bindings in different branches of one `if` or `try` statement are alternatives, and a use points at each of them,
   as a Go name points at every build-tag variant (decided 2026-10-23).
