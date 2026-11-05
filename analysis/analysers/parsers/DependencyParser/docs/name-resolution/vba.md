# Name resolution: VBA

Follows the VBA Language Specification (MS-VBAL), sections 4.2 "Modules", 5.2 "Module Declarations" and 5.6.10
"Simple Name Expressions" to 5.6.12 "Member Access Expressions". VBA resolves every name at compile time from the
modules of its project, so the parser can follow the compiler, except where only the type of a value would tell. No
VBA compiler runs here; each rule follows the specification. The rules shared by every language are in
[README.md](README.md). VB6 forms (`.frm`) follow the same rules.

## Modules

- A module is named by its `VB_Name` attribute, which every export writes (`Attribute VB_Name = "modOrders"`), else by
  its file name without the ending. The folder does not matter.
- A standard module (`.bas`) is a namespace, as a Delphi unit: what it declares has the module name plus its own name
  as logical path, `modOrders.OrderTotal` (decision 1).
- A class, form, report or document module (`.cls`) and a VB6 form (`.frm`) are one declaration each, as a Java class:
  `clsCustomer`, `Form_frmOrders` (decision 1). What they declare belongs to them. A file with a `VERSION` header is
  such a module.

## Declarations

- In a standard module every `Sub`, `Function`, property, `Declare`, module-level variable and constant, `Type` and
  `Enum` is a declaration of its own (decision 1). The `Get`, `Let` and `Set` of a property are one. An enum value
  belongs to its enum (`Red` means `EColor`), a field to its type.
- A declaration is `Public` unless it says otherwise, except a variable and a constant, which are `Private` without
  `Public` or `Global`. `Friend` counts as `Public`: it is visible in the whole project. `Option Private Module` changes
  nothing, as it only hides the module from other projects.
- The uses of a declaration are the names it writes: types after `As`, `New`, `TypeOf … Is` and `Implements`, calls of
  routines and reads of variables and constants. A class module's names, also those outside every routine
  (`Implements`, event parameters), are uses of the class.
- Every branch of an `#If` counts, as both are in the source.

## A simple name `N`

`N` means the first of:

1. A local name: a parameter, a variable or constant the routine declares (`Dim`, `Static`, `Const`), `Me`. No edge.
2. The own module: what it declares, `Private` too. In a class module that is a member of the class itself: no edge
   (shared rule 4).
3. The project: the modules, by their name, and what the standard modules declare `Public`, with the values of their
   public enums; the public enums of class modules (decision 4). A standard module's name alone is no declaration and
   draws no edge.
4. A library (`VBA`, `Access`, `DAO`, `Excel`, …): no edge.

Several modules offering `N` in rule 3 is the compiler's "Ambiguous name detected": the module nearest by folder to the
using file wins, and a tie means nothing (decision 3). Two copies of one module, as in two exported applications, are
one declaration with two copies (shared rule 2).

## A qualified name

- `M.N`, where `M` means a standard module by the rules above, means `N` declared in `M`: any of its declarations if `M`
  is the own module, its `Public` ones otherwise, and the enum of an enum value.
- `C.N`, where `C` means a class module, means the class: the default instance of a form (`Form_frmMain.Caption`) or a
  public enum declared in it.
- `T.N`, where `T` means an enum or a type, means `T`; `V.N`, where `V` means a variable, a constant or a routine, means
  `V`: the rest is a member of a value.
- A chain ends at a call or a bang: `GetCustomer(1).Name` and `rs!Quantity` are members of a value.

## Access forms and reports

A form or report named by a literal means its module (decision 2): `DoCmd.OpenForm "frmX"`,
`DoCmd.OpenForm FormName:="frmX"`, `Forms!frmX` and `Forms("frmX")` mean `Form_frmX`; `DoCmd.OpenReport "rptX"`,
`Reports!rptX` and `Reports("rptX")` mean `Report_rptX`, and so do a project's `AllForms("frmX")` and
`AllReports("rptX")` (`CurrentProject.AllForms("frmX").IsLoaded`). A form without code has no module and draws no
edge. A name in a variable (`DoCmd.OpenForm strName`) draws none.

## Access queries

- A `.sql` file in a folder named `queries` that creates nothing holds the SQL of one Access query, as the export
  tools write it: the query is a view named after its file, `qryOrders` for `queries/qryOrders.sql` (decision 6). Its
  name compares as SQL compares an unquoted name, without regard to case, and its leaf carries it in lower case.
- Its names are looked up as [sql.md](sql.md) says: `FROM qryOrderTotal` means that query, also inside the parentheses
  Access writes around its joins.
- `[Forms]![frmX]![txtY]` means the form module `Form_frmX`, `[Reports]![rptX]` the report module `Report_rptX`; the
  controls after them are no names.
- A call that no SQL routine of the run declares means the `Public` function of a standard module of that name, looked
  up as rule 3 of a simple name does from the query's file: `ToAccessDate(OrderDate)`.
- In VBA, `DoCmd.OpenQuery "qryX"` (also `QueryName:=`), `OpenRecordset("qryX")`, `QueryDefs("qryX")`, the domain
  functions (`DLookup("Field", "qryX", …)`, `DCount`, `DSum`, `DMax`, `DMin`, `DAvg`, `DFirst`, `DLast`) and a row or
  record source set to a name (`Me.cboEmployee.RowSource = "qryX"`) mean the query; a literal that holds SQL
  (`OpenRecordset("SELECT …")`) means none.
- The `DoCmd` methods that take an object type and a name (`Close`, `OutputTo`, `SelectObject`, `DeleteObject`,
  `SendObject`, `Save`) mean the object of that type: `DoCmd.Close acForm, "frmX"` the form module `Form_frmX`,
  `DoCmd.OutputTo acOutputQuery, "qryX"` the query (derived from the Northwind run, 2026-11-05).

## Case

VBA ignores case, and its editor writes every name of a project in one case. The lookup ignores case as well, and a
name in another case than its declaration draws the edge (decision 5).

## Probes

Each rule is tested by a probe under `sample-projects/regression/vba/`. "Gap" means the parser does not follow the
rule yet; `sample-projects/regression/vba/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Modules: the `VB_Name`, not the file name | `spec-module-name` | ok |
| Modules: a standard module's declarations, a class module as one declaration | `spec-module-kinds` | ok |
| Declarations: visibility and its defaults | `spec-visibility` | ok |
| Declarations: a property, an enum value, a type | `spec-property-enum-type` | ok |
| Declarations: `Implements`, `New`, `TypeOf`, event parameters | `spec-class-uses` | ok |
| Simple name 1: parameters, locals, `Me` | `spec-local-hides` | ok |
| Simple name 2: the own module first | `spec-own-module-first` | ok |
| Simple name 3, decision 3: the nearest of two modules, a tie | `spec-ambiguous` | ok |
| Qualified: `M.N`, the own module's private names | `spec-module-qualified` | ok |
| Qualified: a form's default instance, a member of a value | `spec-member-access` | ok |
| Access, decision 2: `DoCmd`, `Forms`, `Reports`, `AllForms`, `AllReports` | `spec-access-objects` | ok |
| Access queries, decision 6: views, forms, VBA functions, `OpenQuery` | `spec-access-queries` | ok |
| Case, decision 5: another case | `spec-case` | ok |
| Shared rule 2, copies | `spec-copies` | ok |

## Not supported

- Members of a value: `customer.Load` means a member of whatever type `customer` has, which only type inference would
  tell; a `With` member (`.MoveFirst`) is no name.
- Undeclared variables (without `Option Explicit`): a name a routine assigns without declaring it is looked up like any
  other, so it means a project declaration of that name.
- Names in strings passed to the project's own routines (`GetRandomPkValue("qryCustomers", …)`): only the routine's
  body tells what the string means.
- Names in strings: `Application.Run "modX.Proc"`, `Eval("Func()")`, the event properties of a form layout
  (`OnClick = "=Func()"`), the record source of a form layout and SQL text in VBA strings.
- A project name in front of a module (`VBAProject.modOrders.Total`) and references to other VBA projects.

## Decisions

1. A standard module's routines, properties, `Declare`s, variables, constants, types and enums are declarations of
   their own, as Delphi's free routines (delphi.md decision 1); a class, form or report module is one declaration whose
   members belong to it, as a Java class (decided by Christian, 2026-11-05).
2. A form or report named by a literal in `DoCmd.OpenForm`, `DoCmd.OpenReport`, `Forms!x`, `Forms("x")`, `Reports!x`
   and `Reports("x")` means its code module `Form_x` or `Report_x` (decided by Christian, 2026-11-05); so does a
   project's `AllForms("x")` and `AllReports("x")`, which Northwind uses to ask whether a form is open (derived from
   the Northwind run, 2026-11-05).
3. A name several modules offer means nothing, as the compiler rejects it, unless one of them is nearer by folder; the
   folder rule tells two exported applications in one repository apart, whose modules may share names (decided by
   Christian, 2026-11-05; the folder part derived from shared rule 2).
4. A public enum and its values are names of the whole project, also when a class module declares it, as the
   specification says (derived 2026-11-05).
5. The lookup ignores case and a name in another case draws the edge, as the compiler; unlike Delphi decision 3, as the
   editor keeps one case per name anyway (decided by Christian, 2026-11-05).
6. An Access query is the `.sql` file of a `queries` folder that creates nothing, as the add-in exports it; it names
   forms and public VBA functions and VBA names it, so VBA and SQL share one name scope (shared rule 1), as Kotlin and
   Java do (decided by Christian, 2026-11-05).
