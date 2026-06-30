# CodeCharta 2.0 — Goal Architecture (mermaid)

> **Draft / target picture — for discussion.** Diagrams are grounded in the *real* codebase
> (actual class, service, slice and model-field names), classified into the goal boxes we agreed on.
>
> **One sentence:** a file is uploaded into a raw **FileStore**; each **lens** projects one data
> signal; a **page** reads the lenses it needs plus the current view state, turns them into a
> **render-model**, and drives a **dumb renderer** through a tiny facade (`load · highlight ·
> settings`) — routing the renderer's events back into shared state. *Nothing but the page knows
> more than one thing.*
>
> Colour key: 🟦 lens (data) · 🟩 renderer (dumb engine) · 🟪 page (the wire) · 🟧 interaction/view-state · ⬜ infra (file store / shell).
> View on GitHub, in VS Code (Markdown Preview Mermaid), or at mermaid.live.

---

## 1 · The full system

```mermaid
flowchart TB
  Upload["⬆ Upload .cc.json / .gz"]:::infra

  subgraph SHELL["Layout shell"]
    direction LR
    NB["NavBar"]:::infra
    EX["Sidebar Explorer"]:::infra
    WB["Workbench<br/>hosts active page + renderer"]:::infra
    IN["Sidebar Inspector"]:::infra
    BB["Bottom / Status bar"]:::infra
  end

  subgraph REND["Renderers — dumb engines (load · highlight · settings ▸ onSelect/onHover)"]
    direction LR
    CM["CodeMap (Map) · Three.js"]:::render
    GR["Graph"]:::renderp
    WC["WordCloud"]:::renderp
    RR["Report"]:::renderp
  end

  subgraph PAGES["① Pages — the only smart layer (the wire)"]
    direction LR
    CMP["CodeMap Page<br/>RenderCodeMapEffect + CodeMapRenderService"]:::page
    GP["Graph Page"]:::pagep
    WP["WordCloud Page"]:::pagep
    RP["Report Page"]:::pagep
  end

  subgraph STATE["② Interaction / view state"]
    direction LR
    SI["Shared interaction<br/>focusedNodeId · selection · delta · hovered · search"]:::inter
    PV["Per-renderer view (CodeMap)<br/>area/height/color/edge metric · colorRange · layoutAlgorithm · camera"]:::inter
    AP["Appearance<br/>mapColors · labels · scaling · edge visibility"]:::inter
  end

  subgraph LENS["③ Lenses — dumb data (facade ▸ repos ▸ store)"]
    direction LR
    SL["Structure Lens<br/>tree · NodeId · Path"]:::lens
    ML["Metrics Lens<br/>attributes · types · descriptors"]:::lens
    DL["Dependency Lens<br/>edges · edge metrics"]:::lens
    TL["Terms Lens (planned)"]:::lensp
    OL["Domain / Security (reserved)"]:::lensp
  end

  subgraph FS["④ FileStore — raw loaded data"]
    direction TB
    PIPE["Load pipeline<br/>UploadFilesService ▸ readFiles ▸ ccFileHelper ▸ fileParser ▸ LoadFileService"]:::infra
    RAW["FileState[] · CCFile · meta + files + lenses (CcJsonV2)"]:::infra
  end

  Upload --> FS
  FS --> SL & ML & DL
  SL & ML & DL --> CMP
  SI --> CMP
  PV --> CMP
  AP --> CMP
  CMP -->|"load(model) · highlight(id) · settings()"| CM
  CM -.->|"onSelect / onHover"| CMP
  CMP -.->|"writes focus / selection"| SI
  CM --> WB
  GP -.-> GR
  WP -.-> WC
  RP -.-> RR

  classDef lens fill:#eaf1fe,stroke:#2563eb,color:#1e3a8a;
  classDef lensp fill:#eaf1fe,stroke:#2563eb,color:#1e3a8a,stroke-dasharray:4 3;
  classDef render fill:#effaf4,stroke:#059669,color:#065f46;
  classDef renderp fill:#effaf4,stroke:#059669,color:#065f46,stroke-dasharray:4 3;
  classDef page fill:#faf7ff,stroke:#7c3aed,color:#5b21b6;
  classDef pagep fill:#faf7ff,stroke:#7c3aed,color:#5b21b6,stroke-dasharray:4 3;
  classDef inter fill:#fff8ef,stroke:#d97706,color:#92400e;
  classDef infra fill:#f1f5f9,stroke:#64748b,color:#334155;
```

---

## 2 · Ingest → FileStore (real load pipeline)

```mermaid
flowchart LR
  A["NavBar folder button"]:::infra --> B["UploadFilesService.uploadFiles()"]:::infra
  B --> C["readFiles()<br/>FileReader + gzip (pako)"]:::infra
  C --> D["getCCFileAndDecorateFileChecksum()<br/>JSON.parse + md5"]:::infra
  D --> E["LoadFileService.loadFiles()"]:::infra
  E --> F["enrichFileStatesAndRecentFiles…()<br/>checkErrors · checkWarnings · removeAuthorsAttributes"]:::infra
  F --> G["getCCFile() ▸ CCFile<br/>NodeDecorator.decorateMapWithPathAttribute"]:::infra
  G --> H["LoadFileStore.setFiles / setStandardByNames"]:::infra
  H --> I["files reducer ▸ FileState[]<br/>(this is the FileStore)"]:::infra
  classDef infra fill:#f1f5f9,stroke:#64748b,color:#334155;
```

---

## 3 · Lens anatomy — features inside (facade ▸ features ▸ repos ▸ store)

A lens is a **module**: a Lens Facade + several **Features** + lens-level **Repos** + a **Store**. Each
feature = `facade · models · components · services`, where **components take data from services** and
**services read the repo**. (Metrics lens shown expanded; Structure & Dependency follow the same shape.)

```mermaid
flowchart TB
  FSx["FileStore · raw meta + files + lenses"]:::infra
  subgraph LENS["Metrics Lens — a module"]
    direction TB
    LF["Lens Facade · rangeOf() · valueOf() · descriptors() · exposes feature panels"]:::lens
    FL["Feature: Legend<br/>components ◀ data ◀ services"]:::feat
    FM["Feature: MetricsBar<br/>components ◀ data ◀ services"]:::feat
    RP["Repos (lens-level) · attributes by id · min/max"]:::lens
    ST["Store · projected + merged for visible files"]:::infra
    LF --- FL
    LF --- FM
    FL -->|services read| RP
    FM -->|services read| RP
    RP -->|reads| ST
  end
  FSx -->|project + merge| ST
  LF -.->|public API| PG["Page → drives Renderer"]:::page

  classDef lens fill:#eaf1fe,stroke:#2563eb,color:#1e3a8a;
  classDef feat fill:#eef2ff,stroke:#4f46e5,color:#3730a3;
  classDef page fill:#faf7ff,stroke:#7c3aed,color:#5b21b6;
  classDef infra fill:#f1f5f9,stroke:#64748b,color:#334155;
```

> Real fields per lens (the Store contents): **Structure** = `Node(name,type,children,link)` ·
> `NodeId(sha256 path)` · `Path` · `NodeType`. **Metrics** = `attributes` · `attributeTypes(ABSOLUTE/RELATIVE)`
> · `attributeDescriptors` · `clusters`. **Dependency** = `Edge(fromId,toId,attributes)` · edge types/descriptors.
> Each lens's features differ (Structure: Explorer/Search/ContextMenu · Dependency: EdgeSettings/Graph-ctrls).

---

## 4 · Inside the CodeMap (Map) renderer — the dumb engine

```mermaid
flowchart TB
  FACADE["facade the page calls:<br/>load(model) · highlight(id) · settings()  ▸ onSelect / onHover"]:::page

  subgraph ENG["CodeMap renderer (knows Three.js, not cc.json)"]
    HOST["CodeMapComponent — host canvas"]:::render
    subgraph V["Three viewer"]
      direction LR
      TV["ThreeViewerService"]:::render
      TS["ThreeSceneService<br/>scene · lights · groups · selection"]:::render
      TR["ThreeRendererService<br/>WebGL + CSS2D"]:::render
      TC["ThreeCameraService"]:::render
      TM["ThreeMapControlsService<br/>zoom/pan/auto-fit"]:::render
      TST["ThreeStatsService (dev)"]:::render
    end
    subgraph G["Geometry"]
      direction LR
      GG["GeometryGenerator"]:::render
      MESH["CodeMapMesh<br/>InstancedMesh + ShaderMaterial"]:::render
      BLD["CodeMapBuilding"]:::render
      GEO["CodeMapGeometricDescription<br/>BVH ray-cast"]:::render
      SH["CodeMapShaderStrings · geometryGenerationHelper"]:::render
      FLD["FloorLabelDrawer"]:::render
    end
    ARR["CodeMapArrowService — edges ▸ bezier"]:::render
    TT["CodeMapTooltipService"]:::render
    ID["IdToBuildingService — id ▸ building"]:::render
  end

  FACADE --> HOST
  HOST --> TV --> TS & TR
  GG --> MESH --> TS

  classDef render fill:#effaf4,stroke:#059669,color:#065f46;
  classDef page fill:#faf7ff,stroke:#7c3aed,color:#5b21b6;
```

---

## 5 · The render cycle (page = the wire)

```mermaid
sequenceDiagram
  autonumber
  participant ST as Store (lenses + view state)
  participant FX as RenderCodeMapEffect (page)
  participant RS as CodeMapRenderService (page)
  participant RM as Render-model builder (layout + NodeDecorator)
  participant EN as Map renderer (ThreeScene/Renderer)
  ST->>FX: state changed (visible files / metric / colors)
  FX->>RS: render(map, settings)  (throttled ~60fps)
  RS->>RM: layout(tree) + decorate(metrics, colorMetric, colorRange)
  RM-->>RS: Node[] positioned + colored
  RS->>EN: setMapMesh(CodeMapMesh)
  EN->>EN: ThreeRendererService.render()
```

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant ME as CodeMapMouseEventService (page)
  participant EN as Map renderer (raycast)
  participant SI as Shared interaction
  U->>ME: hover / click
  ME->>EN: raycast against CodeMapMesh
  EN-->>ME: nodeId
  ME->>SI: setHoveredNodeId / setSelectedBuildingId
```

---

## 6 · Where the real ngrx slices go (interaction / view-state split)

```mermaid
flowchart LR
  SH["<b>Shared interaction</b> — survives renderer switch<br/>hoveredNodeId · selectedBuildingId · rightClickedNodeData<br/>focusedNodePath · searchPattern<br/>file selection + delta (FileState.selectedAs) · blacklist"]:::inter
  PR["<b>Per-renderer view (CodeMap)</b> — resets on leave<br/>area / height / color / edge / distribution metric<br/>colorRange · colorMode · margin · sortingOption · sortingOrderAscending<br/>layoutAlgorithm · invertArea · invertHeight · hideFlatBuildings<br/>isColorMetricLinkedToHeightMetric · showOnlyBuildingsWithEdges<br/>resetCameraIfNewFileIsLoaded · maxTreeMapFiles · camera"]:::inter
  AP["<b>Appearance</b><br/>mapColors · scaling · markedPackages · isWhiteBackground · isPresentationMode<br/>labels: colorLabels · labelMode · labelSize · amountOfTopLabels · labelsPerMap · groupLabelCollisions · showMetricLabelNodeName · showMetricLabelNameValue · enableFloorLabels<br/>edges: isEdgeMetricVisible · showIncomingEdges · showOutgoingEdges · edgeHeight · amountOfEdgePreviews"]:::inter
  APP["<b>App status</b> — global<br/>isLoadingFile · isLoadingMap · currentFilesAreSampleFiles<br/>screenshotToClipboardEnabled · experimentalFeaturesEnabled"]:::infra
  LENSD["<b>Lens data (NOT view-state)</b><br/>attributeTypes + attributeDescriptors ▸ split Metrics vs Dependency lens<br/>edges ▸ Dependency lens · file tree ▸ Structure lens"]:::lens
  classDef inter fill:#fff8ef,stroke:#d97706,color:#92400e;
  classDef infra fill:#f1f5f9,stroke:#64748b,color:#334155;
  classDef lens fill:#eaf1fe,stroke:#2563eb,color:#1e3a8a;
```

> Decisions encoded above: `blacklist` and `markedPackages` are **view concerns**, not lens data
> (a user filter / highlight, not a signal from the file). `attributeTypes` / `attributeDescriptors`
> **split** — node metrics ▸ Metrics lens, edge metrics ▸ Dependency lens.

---

## 7 · Cross-renderer jump (why shared interaction must exist)

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant GP as Graph page
  participant SI as Shared interaction
  participant WB as Workbench
  participant CP as CodeMap page
  participant SL as Structure lens
  participant EN as CodeMap renderer
  U->>GP: right-click node ▸ "Open in CodeMap"
  GP->>SI: focusNode(id)
  GP->>WB: activate CodeMap
  WB->>CP: mount
  CP->>SI: read focusedNodeId
  CP->>SL: nodeById(id) ▸ locate
  CP->>EN: highlight(id) + center
```

> The `id` is the cc.json 2.0 node id (sha-256 of canonical path, 16 hex). The same id keys the
> structure tree, the metrics, and the edge endpoints — so it joins lenses **and** resolves in any
> renderer. This is what makes the jump possible.

---

## 8 · Today → goal (it already exists, just renamed)

| Today (real code) | Goal box |
|---|---|
| `CodeMapRenderService`, `ThreeSceneService`/`ThreeViewerService`/`ThreeRendererService`, `GeometryGenerator`, `CodeMapMesh`, `CodeMapBuilding`, `CodeMapGeometricDescription`, shaders, `FloorLabelDrawer` | **Renderer** (Map engine) + render-model builder |
| `RenderCodeMapEffect`, `CodeMapComponent`, `CodeMapMouseEventService`, `CodeMapArrowService`, `CodeMapTooltipService`, `IdToBuildingService` | **CodeMap Page** (the wire) |
| 99 `*Store` facades + `state/store` selectors | **Lens facades** (one per lens) + small view stores |
| `fileSettings.attributeTypes` / `attributeDescriptors` | **Metrics** + **Dependency** lens (split) |
| `fileSettings.edges` | **Dependency** lens |
| `dynamicSettings.*` (area/height/color/edge metric, colorRange, margin, layoutAlgorithm…) | **Per-renderer view state** |
| `appSettings.mapColors` / labels / scaling / edge visibility | **Appearance** |
| `appStatus.*` + `files[].selectedAs` + `focusedNodePath` + `searchPattern` + `blacklist` | **Shared interaction** |
| `UploadFilesService` ▸ `readFiles` ▸ `ccFileHelper` ▸ `fileParser` ▸ `LoadFileService` ▸ `LoadFileStore` ▸ `files` reducer | **FileStore** + load pipeline |
| analysis `Project` / `CcJsonV2` (`meta`, `files`, `lenses`: `MetricsLens`/`DependencyLens`/opaque) | the cc.json 2.0 contract the lenses mirror |

---

*Companion to `Ideas/image.png`, `Ideas/codecharta-2.0-architecture.html`, and
`Ideas/codecharta-2.0-goal-architecture.html`. Generated from a live inventory of the repo — names
reflect current code; the box assignment is the proposed target. Not final.*
