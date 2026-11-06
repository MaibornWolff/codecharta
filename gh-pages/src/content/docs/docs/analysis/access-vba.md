---
title: "Analyse an Access or VBA application"
description: "Export the VBA modules, forms, reports, macros and queries of an MS Access application, or the modules of an Excel or Word file, and map them with ccsh."
sidebar:
  label: "Access and VBA"
---

CodeCharta reads the source files an Office application exports, not the `.accdb`, `.xlsm` or `.docm` file itself.
Export the application into a folder first, then map that folder like any other codebase:

```bash
ccsh analyse codecharta-export
```

## Export an Access application

The export macro
[`CodeChartaExport.bas`](https://github.com/MaibornWolff/codecharta/blob/main/analysis/script/access-export/CodeChartaExport.bas)
writes everything CodeCharta reads:

1. Open the application in Access and the VBA editor with `Alt+F11`.
2. Import the macro with _File > Import File…_ and pick `CodeChartaExport.bas`.
3. Run `ExportForCodeCharta` (place the cursor in it and press `F5`).
4. The export lands in the folder `codecharta-export` next to the database. Delete the module `CodeChartaExport` again,
   or keep it out of the map with `-e CodeChartaExport`.

| Folder     | Holds                                                      | Ending              |
|------------|------------------------------------------------------------|---------------------|
| `vba`      | standard modules, class modules, form and report modules   | `.bas`, `.cls`      |
| `forms`    | the layout of each form                                    | `.form`             |
| `reports`  | the layout of each report                                  | `.report`           |
| `macros`   | each stand-alone macro                                     | `.macro`            |
| `queries`  | the SQL of each query                                      | `.sql`              |

Tables and their relationships are not exported: they hold no logic, and CodeCharta does not map them.

An export of the [msaccess-vcs-addin](https://github.com/joyfullservice/msaccess-vcs-addin) works for the modules and
the `.sql` queries. It writes layouts, macros and query designs as `.bas` files, which CodeCharta would read as VBA
modules, so leave them out:

```bash
ccsh analyse my-app.src -e '(forms|reports|macros|queries)/[^/]*\.bas$'
```

## Export from Excel or Word

Export the modules from the VBA editor with _File > Export File…_ (or any tool that writes the VBA project to files)
into one folder: standard modules as `.bas`, class and document modules (`ThisWorkbook`, `Tabelle1`) as `.cls`,
UserForms as `.frm`. VB6 forms (`.frm`) are read the same way.

## What the map shows

- [Unified Parser](/docs/parser/unified#supported-languages): complexity, functions, lines of code and comment lines of
  every module. A form or report layout counts the lines that hold logic (expressions, the SQL of its record and row
  sources) and its `number_of_controls`; a macro counts its actions and conditions, its submacros as functions.
- [Dependency Parser](/docs/parser/dependency): the edges between modules, from a module to the forms, reports, queries
  and macros it opens, from a layout to its sources, subforms, code module and the functions its expressions call, from
  a macro to what its actions open and run, and from a query to the forms and VBA functions it names. The rules are
  spelled out in
  [`vba.md`](https://github.com/MaibornWolff/codecharta/blob/main/analysis/analysers/parsers/DependencyParser/docs/name-resolution/vba.md).
- [Domain Language Parser](/docs/parser/domain-language): the words of the names, captions, messages and comments,
  without the VBA keywords and the naming prefixes of Access (`frm`, `qry`, `txt`).

A VBA module that the editor exported in the Windows code page reads as such, so umlauts stay intact; a layout or macro
reads in UTF-16, as Access writes it.

## Not read

- The code inside an `.accdb`, `.xlsm` or `.docm` file: export it first.
- Tables, relationships and the data macros of tables.
- A name held in a variable (`DoCmd.OpenForm strName`), SQL text built in VBA, the member `CallByName` names, and an
  Excel sheet named by its caption (`Worksheets("Kunden")`); a sheet named by its code name (`Tabelle1`) draws its
  edge.
- VB6 project files (`.vbp`), user controls (`.ctl`) and designers (`.dsr`).
