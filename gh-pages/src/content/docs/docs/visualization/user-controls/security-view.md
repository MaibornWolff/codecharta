---
title: "Security view"
description: "The Security view of the CodeCharta Web Studio lists the third-party packages of a map with their known vulnerabilities and how far they are behind, and the files that use them."
---

The Security view lists the third-party packages of a map made with the [SBOM importer](/docs/importer/sbom): each
package once, with its version, its newest stable version, how many stable versions are newer, the days since the first
of them came out, the libyears to the newest one, and its known vulnerabilities by severity. The most severe and the
longest outdated packages come first.

The summary above the list counts the packages, the vulnerable and the outdated ones and the mean days outdated, and
names the scanner the vulnerabilities come from and the day the versions were looked up. What the map does not carry
reads "not measured", never 0.

## Finding a package

- **Filter** by a package's name or purl.
- **Only vulnerable or outdated** hides the packages that have neither.
- **Show in Security** in a file's or folder's context menu on the map lists only the packages that file or folder
  declares in a lockfile or imports, including everything those pull in. Clear it with the ✕ next to its name.

Click a package to see its vulnerabilities with their scores and the versions that fix them, the lockfiles that declare
it and the code files that use it. Click a file to select it on the metric map.

## On the map

A lockfile and every code file that imports a package carry five metrics you can pick for area, height or colour:

| Metric                | Meaning                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `packages`            | packages a lockfile declares, or a code file imports together with everything they pull in      |
| `vulnerable_packages` | of those, the ones with a known vulnerability                                                    |
| `worst_severity`      | the highest severity among them: 4 critical, 3 high, 2 medium, 1 low or unknown, 0 none          |
| `mean_days_outdated`  | mean days since a newer stable version came out, 0 for an up-to-date package                     |
| `outdated_packages`   | of those, the ones with a newer stable version                                                  |

A code file reaches a package only when the [Dependency parser](/docs/parser/dependency) named its imports, which
`ccsh analyse --sbom` does in one run.

## Related

- [SBOM importer](/docs/importer/sbom)
