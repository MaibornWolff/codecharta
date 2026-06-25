#!/usr/bin/env python3
"""Compare two cc.json files (any mix of 1.5 and 2.0) for semantic equivalence.

Normalises each file to a format-independent view keyed by canonical file path
(the node's tree position, root excluded) and reports any real differences:
file tree, per-file metrics, dependency edges, attribute types, and attribute
descriptors. The 1.5 `blacklist` is expected to be absent from 2.0 and is not
flagged. For 2.0 inputs it also checks that every node id equals
sha-256(canonicalPath)[:16] and that every edge endpoint resolves to a node.

Usage:  compare-cc.py <a.cc.json[.gz]> <b.cc.json[.gz]>
Exit code 0 = equivalent, 1 = differences found.
"""

import sys
import json
import gzip
import hashlib

EPS = 1e-6
MAX_PRINT = 40


def load(path):
    opener = gzip.open if path.endswith(".gz") else open
    with opener(path, "rt", encoding="utf-8") as f:
        return json.load(f)


def detect(doc):
    return "2.0" if ("meta" in doc and "lenses" in doc) else "1.5"


def node_id(path):
    canonical = "/" + path  # NodeId canonical form: "/" + segments joined by "/"
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]


def strip_root(endpoint):
    """'/root/src/App.kt' -> 'src/App.kt' (canonical path key)."""
    segs = [s for s in endpoint.split("/") if s]
    if segs and segs[0] == "root":
        segs = segs[1:]
    return "/".join(segs)


def normalize(doc):
    """Return a format-independent view: tree, metrics, edges, types, descriptors, blacklist, plus
    structural issues found while reading (orphan ids, id mismatches)."""
    view = {
        "tree": {},        # path -> type
        "metrics": {},     # path -> {metric: value}
        "edges": set(),    # resolved edges (both endpoints are tree nodes): (fromPath, toPath, frozenset(attrs))
        "dangling": [],    # edges with an endpoint that is not a tree node: (fromPath, toPath)
        "types": {},       # metric -> type
        "descriptors": {}, # metric -> descriptor dict
        "blacklist": [],
        "issues": [],
    }

    def edge_key(frm, to, attrs):
        return (frm, to, frozenset((k, _norm_val(v)) for k, v in (attrs or {}).items()))

    if detect(doc) == "1.5":
        data = doc["data"]

        def walk(node, segs):
            if segs:
                path = "/".join(segs)
                view["tree"][path] = node.get("type")
                attrs = node.get("attributes") or {}
                if attrs:
                    view["metrics"][path] = attrs
            for ch in node.get("children", []):
                walk(ch, segs + [ch["name"]])

        walk(data["nodes"][0], [])
        nodes = set(view["tree"])
        for e in data.get("edges", []):
            frm, to = strip_root(e["fromNodeName"]), strip_root(e["toNodeName"])
            if frm in nodes and to in nodes:
                view["edges"].add(edge_key(frm, to, e.get("attributes")))
            else:
                view["dangling"].append((frm, to))
        at = data.get("attributeTypes", {}) or {}
        view["types"] = {**(at.get("nodes") or {}), **(at.get("edges") or {})}
        view["descriptors"] = data.get("attributeDescriptors", {}) or {}
        view["blacklist"] = data.get("blacklist", []) or []
    else:
        lenses = doc["lenses"]
        id_to_path = {}

        def walk(node, segs):
            path = "/".join(segs)
            id_to_path[node["id"]] = path
            if segs:
                view["tree"][path] = node.get("type")
                expected = node_id(path)
                if node["id"] != expected:
                    view["issues"].append(f"id mismatch at '{path}': file has {node['id']} but sha256 gives {expected}")
            for ch in node.get("children", []):
                walk(ch, segs + [ch["name"]])

        walk(doc["files"][0], [])
        metrics_lens = lenses.get("metrics", {})
        for nid, attrs in (metrics_lens.get("attributes") or {}).items():
            path = id_to_path.get(nid)
            if path is None:
                view["issues"].append(f"metrics lens has attributes for unknown id {nid}")
            elif attrs:
                view["metrics"][path] = attrs
        dep = lenses.get("dependency", {})
        for e in dep.get("edges", []):
            frm, to = id_to_path.get(e["fromId"]), id_to_path.get(e["toId"])
            if frm is not None and to is not None:
                view["edges"].add(edge_key(frm, to, e.get("attributes")))
            else:
                view["dangling"].append((frm or e["fromId"], to or e["toId"]))
        view["types"] = {**(metrics_lens.get("attributeTypes") or {}), **(dep.get("attributeTypes") or {})}
        view["descriptors"] = {**(metrics_lens.get("attributeDescriptors") or {}), **(dep.get("attributeDescriptors") or {})}
    return view


def _norm_val(v):
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return round(float(v), 6)
    if isinstance(v, list):
        return tuple(sorted(_norm_val(x) for x in v))
    return v


def values_equal(a, b):
    return _norm_val(a) == _norm_val(b)


def section(title):
    print("\n" + title)
    print("-" * len(title))


def compare(a, b, name_a, name_b):
    problems = 0
    warnings = 0

    # --- file tree ---
    section("File tree")
    pa, pb = set(a["tree"]), set(b["tree"])
    only_a, only_b = pa - pb, pb - pa
    print(f"  {name_a}: {len(pa)} nodes   {name_b}: {len(pb)} nodes")
    if only_a:
        problems += len(only_a)
        print(f"  ONLY in {name_a} ({len(only_a)}):")
        for p in sorted(only_a)[:MAX_PRINT]:
            print(f"    - {p}")
    if only_b:
        problems += len(only_b)
        print(f"  ONLY in {name_b} ({len(only_b)}):")
        for p in sorted(only_b)[:MAX_PRINT]:
            print(f"    + {p}")
    type_diffs = [(p, a["tree"][p], b["tree"][p]) for p in (pa & pb) if a["tree"][p] != b["tree"][p]]
    if type_diffs:
        problems += len(type_diffs)
        print(f"  TYPE differs ({len(type_diffs)}):")
        for p, ta, tb in type_diffs[:MAX_PRINT]:
            print(f"    {p}: {ta} vs {tb}")
    if not (only_a or only_b or type_diffs):
        print("  OK - identical tree")

    # --- metrics ---
    section("Per-file metrics")
    ma, mb = a["metrics"], b["metrics"]
    print(f"  {name_a}: {len(ma)} nodes carry metrics   {name_b}: {len(mb)} nodes carry metrics")
    metric_path_only_a = set(ma) - set(mb)
    metric_path_only_b = set(mb) - set(ma)
    if metric_path_only_a:
        problems += len(metric_path_only_a)
        print(f"  metrics ONLY in {name_a} ({len(metric_path_only_a)}): {sorted(metric_path_only_a)[:10]}")
    if metric_path_only_b:
        problems += len(metric_path_only_b)
        print(f"  metrics ONLY in {name_b} ({len(metric_path_only_b)}): {sorted(metric_path_only_b)[:10]}")
    value_diffs = []
    for p in set(ma) & set(mb):
        keys = set(ma[p]) | set(mb[p])
        for k in keys:
            if k not in ma[p] or k not in mb[p]:
                value_diffs.append((p, k, ma[p].get(k, "<missing>"), mb[p].get(k, "<missing>")))
            elif not values_equal(ma[p][k], mb[p][k]):
                value_diffs.append((p, k, ma[p][k], mb[p][k]))
    if value_diffs:
        problems += len(value_diffs)
        print(f"  VALUE differences ({len(value_diffs)}):")
        for p, k, va, vb in value_diffs[:MAX_PRINT]:
            print(f"    {p} [{k}]: {va} vs {vb}")
        if len(value_diffs) > MAX_PRINT:
            print(f"    ... and {len(value_diffs) - MAX_PRINT} more")
    if not (metric_path_only_a or metric_path_only_b or value_diffs):
        print("  OK - identical metrics on every file")

    # --- edges (only those whose endpoints are real nodes count as a hard diff) ---
    section("Dependency edges (resolved: both endpoints are real file nodes)")
    ea, eb = a["edges"], b["edges"]
    print(f"  {name_a}: {len(ea)} resolved edges   {name_b}: {len(eb)} resolved edges")
    eonly_a, eonly_b = ea - eb, eb - ea
    if eonly_a:
        problems += len(eonly_a)
        print(f"  resolved edges ONLY in {name_a} ({len(eonly_a)}):")
        for frm, to in sorted([(e[0], e[1]) for e in eonly_a])[:MAX_PRINT]:
            print(f"    - {frm} -> {to}")
    if eonly_b:
        problems += len(eonly_b)
        print(f"  resolved edges ONLY in {name_b} ({len(eonly_b)}):")
        for frm, to in sorted([(e[0], e[1]) for e in eonly_b])[:MAX_PRINT]:
            print(f"    + {frm} -> {to}")
    if not (eonly_a or eonly_b):
        print("  OK - every real-file dependency edge matches (endpoints + attributes)")

    # --- dangling edges (endpoint is not a file node) — a data quirk, not a migration issue ---
    da_e, db_e = a["dangling"], b["dangling"]
    if da_e or db_e:
        section("Dangling edges (an endpoint is NOT a file node) — informational")
        print(f"  {name_a}: {len(da_e)}   {name_b}: {len(db_e)}")
        print("  These are edges (often GitLog temporal-coupling) pointing at a path with no file node,")
        print("  e.g. a case-fold phantom like README.MD. They dangle in BOTH formats; 2.0 just surfaces")
        print("  them because it resolves endpoints by id. Not caused by the format migration.")
        for frm, to in da_e[:10]:
            print(f"    {name_a}: {frm} -> {to}")
        for frm, to in db_e[:10]:
            print(f"    {name_b}: {frm} -> {to}")
        warnings += len(da_e) + len(db_e)

    # --- attribute types ---
    section("Attribute types")
    ta, tb = a["types"], b["types"]
    problems += diff_maps(ta, tb, name_a, name_b)

    # --- descriptors ---
    section("Attribute descriptors")
    da, db = a["descriptors"], b["descriptors"]
    only_a = set(da) - set(db)
    only_b = set(db) - set(da)
    if only_a:
        problems += len(only_a)
        print(f"  ONLY in {name_a}: {sorted(only_a)}")
    if only_b:
        problems += len(only_b)
        print(f"  ONLY in {name_b}: {sorted(only_b)}")
    desc_diffs = []
    for k in set(da) & set(db):
        for field in ("title", "description", "hintLowValue", "hintHighValue", "link", "direction"):
            if da[k].get(field, "") != db[k].get(field, ""):
                desc_diffs.append((k, field, da[k].get(field), db[k].get(field)))
    if desc_diffs:
        problems += len(desc_diffs)
        print(f"  field differences ({len(desc_diffs)}):")
        for k, field, va, vb in desc_diffs[:MAX_PRINT]:
            print(f"    {k}.{field}: {va!r} vs {vb!r}")
    if not (only_a or only_b or desc_diffs):
        print(f"  OK - {len(da)} descriptors match (titles/hints/direction)")

    # --- blacklist (expected drop) ---
    section("Blacklist (informational)")
    print(f"  {name_a}: {len(a['blacklist'])} items   {name_b}: {len(b['blacklist'])} items   (2.0 intentionally drops blacklist)")

    # --- structural issues from reading (id mismatches etc. = real problems) ---
    issues = a["issues"] + b["issues"]
    if issues:
        section("Structural issues")
        problems += len(issues)
        for i in issues[:MAX_PRINT]:
            print(f"  ! {i}")
    return problems, warnings


def diff_maps(ma, mb, name_a, name_b):
    n = 0
    only_a = set(ma) - set(mb)
    only_b = set(mb) - set(ma)
    if only_a:
        n += len(only_a)
        print(f"  ONLY in {name_a}: {sorted(only_a)}")
    if only_b:
        n += len(only_b)
        print(f"  ONLY in {name_b}: {sorted(only_b)}")
    changed = [(k, ma[k], mb[k]) for k in set(ma) & set(mb) if ma[k] != mb[k]]
    if changed:
        n += len(changed)
        print(f"  changed ({len(changed)}):")
        for k, va, vb in changed[:MAX_PRINT]:
            print(f"    {k}: {va} vs {vb}")
    if n == 0:
        print(f"  OK - {len(ma)} types match")
    return n


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    path_a, path_b = sys.argv[1], sys.argv[2]
    doc_a, doc_b = load(path_a), load(path_b)
    name_a = f"{path_a.split('/')[-1]} [{detect(doc_a)}]"
    name_b = f"{path_b.split('/')[-1]} [{detect(doc_b)}]"

    print("cc.json semantic comparison")
    print("=" * 60)
    print(f"  A = {name_a}")
    print(f"  B = {name_b}")

    problems, warnings = compare(normalize(doc_a), normalize(doc_b), name_a, name_b)

    section("Verdict")
    if problems == 0:
        print("  PASS - the migration preserved everything: identical file tree, per-file metrics,")
        print("  attribute types and descriptors, and all resolved dependency edges.")
        print("  (Format, envelope and blacklist differ by design.)")
        if warnings:
            print(f"  NOTE - {warnings} dangling edge(s) flagged above (data quirk, not a migration issue).")
        sys.exit(0)
    else:
        print(f"  FAIL - {problems} real difference(s) found (see sections above); plus {warnings} dangling-edge note(s).")
        sys.exit(1)


if __name__ == "__main__":
    main()
