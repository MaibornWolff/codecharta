# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeCharta is a code visualization tool that generates 3D treemap visualizations of codebases. It consists of two main components:

- **Analysis (Kotlin/Java)**: CLI tool (`ccsh`) that parses source code, imports metrics from external tools, and generates `.cc.json` files
- **Visualization (TypeScript/Angular)**: Web and desktop application that renders `.cc.json` files as interactive 3D treemaps using Three.js

## Requirements

- Java >= 11, <= 21
- Node >= 20
- Git (with bash utilities for Windows)

## Common Development Commands

### Root Directory

```bash
# Install root dependencies (Husky, BiomeJS for formatting)
npm i

# Format all files
npm run format

# Check formatting
npm run format:check
```

### Analysis (Kotlin/Gradle)

```bash
cd analysis

# Build the project (creates distribution in build/)
./gradlew build

# Install distribution locally for testing
./gradlew installDist

# Run all tests
./gradlew test

# Run integration tests (requires bash on Windows, timeout on macOS)
./gradlew integrationTest

# Check code style
./gradlew ktlintCheck

# Auto-format code
./gradlew ktlintFormat

# Run a single test class
./gradlew test --tests "ClassName"

# Run Sonar analysis
./gradlew sonar

# Use installed ccsh (after installDist)
./build/install/codecharta-analysis/bin/ccsh
```

**Note**: On Windows, add Git's `sh.exe` (typically `C:\path-to-git\Git\bin`) to PATH for integration tests. On macOS, install `timeout` via `brew install coreutils`.

### Visualization (TypeScript/Angular)

```bash
cd visualization

# Install dependencies
npm i

# Start development server (web version)
npm run dev

# Build for production
npm run build

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:auto

# Run tests without coverage
npm run test:autoNoCoverage

# Update snapshots
npm run test:updateSnaps

# Run e2e tests
npm run e2e

# Run e2e tests in CI mode (sequential)
npm run e2e:ci

# Run e2e tests in watch mode
npm run e2e:auto

# Start desktop client (requires build first)
npm run start

# Package desktop app for distribution
npm run package

# Generate JSON schema from TypeScript types
npm run schema:generate
```

## Architecture Overview

### Analysis Architecture

**Design Pattern**: Pipes and Filters architecture with plugin-based analysers

**Main Entry Point**: `analysis/ccsh/src/main/kotlin/de/maibornwolff/codecharta/ccsh/Ccsh.kt`
- Uses Picocli for CLI command structure
- Supports interactive mode, direct execution, and pipe chaining
- Registers all analysers (parsers, importers, filters, tools)

**Core Components**:

1. **AnalyserInterface**: Base interface for all analysers with methods:
   - `call()`: Execute the analyser
   - `isApplicable()`: Check if applicable to input
   - `getDialog()`: Interactive configuration UI

2. **Parsers** (`analysis/analysers/parsers/`): Extract metrics from source code
   - `GitLogParser`: Git commit history metrics
   - `SVNLogParser`: SVN log metrics
   - `RawTextParser`: Generic text metrics
   - `UnifiedParser`: Multi-language source code parser (modern replacement for SourceCodeParser)

3. **Importers** (`analysis/analysers/importers/`): Import from external tools
   - `SonarImporter`: SonarQube metrics
   - `CoverageImporter`: Code coverage data
   - `CSVImporter`: Generic CSV metrics
   - `CodeMaatImporter`: CodeMaat output
   - `TokeiImporter`: Tokei language statistics
   - `SourceMonitorImporter`: SourceMonitor data

4. **Filters** (`analysis/analysers/filters/`): Transform cc.json files
   - `MergeFilter`: Combine multiple cc.json files (supports recursive/leaf strategies, MIMO mode)
   - `EdgeFilter`: Aggregate edge attributes into nodes
   - `StructureModifier`: Modify file/folder tree structure

5. **Tools** (`analysis/analysers/tools/`):
   - `ValidationTool`: Validate cc.json schema compliance
   - `InspectionTool`: Display cc.json file information

The UnifiedParser is the most actively developed component:
- Uses TreeSitter for parsing multiple languages
- Metric calculators extend `MetricPerFileCalc` or `MetricPerFunctionCalc`
- Language support defined in `metricnodetypes/` with node type mappings to language constructs
- Each metric calculator implements `calculateMetricForNode(params: CalculationContext)`

**Data Model** (`analysis/model/`):
- `Project`: Root container (API version 1.5)
  - `rootNode`: Single root Node
  - `edges`: List of Edge connections
  - `attributeTypes`: Metric type definitions
  - `attributeDescriptors`: Metric metadata
  - `blacklist`: Excluded items
- `Node`/`MutableNode`: Immutable/mutable tree nodes representing files/folders
- `Edge`: Connections between nodes
- `ProjectSerializer`/`ProjectDeserializer`: GSON-based JSON serialization with optional GZIP compression

**Data Flow**:
```
Source Code → Parser/Importer → Project → Filter → Serializer → cc.json
```

Commands can be chained using pipes:
```bash
ccsh gitlogparser -r . | ccsh mergefilter - other.cc.json -o combined.cc.json
```

### Visualization Architecture

**Framework**: Angular 20 with standalone components, ngrx state management, Three.js rendering

**Main Entry Point**: `visualization/app/main.ts` → `CodeChartaComponent`

**State Management** (ngrx):
- `appSettings`: UI preferences (layout algorithm, scaling, colors, labels)
- `dynamicSettings`: Visualization controls (areaMetric, heightMetric, colorMetric, edgeMetric)
- `fileSettings`: Per-file configuration (blacklist, marked packages, edges)
- `appStatus`: Runtime state (hoveredNodeId, selectedBuildingId)
- `files`: File management

Each state slice has dedicated actions, reducers, and selectors. Effects (`state/effects/`) handle side effects like rendering, persistence, and URL synchronization.

**3D Rendering** (Three.js):
- `ThreeSceneService`: Manages Three.js scene, lighting, building interactions
- `CodeMapMesh`: Custom shader-based mesh with optimized geometry generation
- `CodeMapBuilding`: Individual building representation with color management
- `ThreeViewerService`, `ThreeRendererService`, `ThreeMapControls`, `ThreeCamera`: Supporting services

**Rendering Pipeline**:
1. State change → ngrx effect triggers
2. Effect calls `GeometryGenerator.build()`
3. Shader-based geometry creates single optimized mesh
4. Color attributes update vertex colors
5. Raycasting for mouse interactions

**Layout Algorithms**:
- `SquarifiedTreeMap`: Traditional treemap layout
- `StreetMap`: Street-like layout with buildings along paths
- `TreeMapStreet`: Hybrid approach

**UI Components**:
- `ToolBar`: File upload, presentation mode
- `RibbonBar`: Metric selection, settings
- `FilePanel`: Multi-file selection, delta mode
- `NodeContextMenu`: Right-click actions (focus, flatten, exclude)
- `AttributeSideBar`: Metrics display
- `LegendPanel`: Color scale visualization

**Desktop vs Web**:
- Both use identical Angular application
- Desktop: Electron wrapper (`electron/main.js`)
- Web: Served via HTTP, Docker support available
- Shared: IndexedDB persistence, screenshot capture, file upload

## Development Workflow

### Planning

**For every new instruction, create a plan** in the `plans/` folder using `template.md` as a base:

- Plans act as high-level guidance for implementation
- Focus on mandatory steps only, avoid excessive detail
- keep plans simple and concise
- avoid over-elaboration, detailed sections, or comprehensive documentation style
- plans should be brief, actionable outlines rather than detailed specifications
- Use checkable steps (markdown checkboxes) to track progress
- Update `state` field as work progresses: `todo` → `progress` → `complete`

### Branching Strategy

- Main branch: `main`
- Branch naming: `<type>/<issue-id>/<name>` (e.g., `feature/123/add-dark-mode`)
- Types: `feature`, `fix`, `docs`, `revert`, `codestyle`, `tech`
- Always rebase on main: `git rebase main`
- After rebase: `git push --force-with-lease`

### Commit Message Format

```
<type>(<scope?>): <subject>(#<issue-number?>)

<body-description?>
```

- Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`
- Scopes: `analysis`, `visualization`, `docker`, `gh-pages`, `docs`, `readme`, `stg`, `config`
- Use imperative mood: "Add feature" not "Added feature"
- Limit subject line to 72 characters
- Breaking changes: Use `!` before `:` (e.g., `feat!: breaking change`)

Example: `feat(visualization): add dark mode toggle (#123)`

### Pull Requests

- Name PR like branch name
- Follow PR template
- Add appropriate labels
- All tests must pass before merge
- Prefer rebase over squash merge for clean history
- Update CHANGELOG.md with changes (follow https://keepachangelog.com)

### Code Style

**Analysis (Kotlin)**:
- Based on official Kotlin Coding Conventions
- Auto-formatted via `./gradlew ktlintFormat`
- Rules defined in `.editorconfig`
- **Function syntax**: Use block-body style with braces `{ }` consistently, not expression-body style with `=`
- **Guard clauses**: Use early returns for error conditions and edge cases to reduce nesting
- **Magic strings/numbers**: Extract repeated literals to constants in `companion object`
- **Function organization**: Group related functions with section comments
- **Parameter naming**: Use consistent, descriptive names across related functions
- **Exceptions**: Always create exception classes in their own separate files

**Visualization (TypeScript)**:
- Formatted with BiomeJS
- Install Biome extension and format on save
- Git hooks auto-format on commit via Husky

**Commits**:
- Husky runs pre-commit hooks automatically
- Lint-staged formats files before commit
- Analysis is NOT auto-linted on commit

### Code Quality Guidelines

**General Principles**:
- **DRY**: Extract repeated logic into reusable functions
- **Clean Code**: Self-documenting code with clear intent
- **SOLID**: Single responsibility, open/closed, dependency inversion
- **Expressive Naming**: Descriptive names that reveal intent
- **Fix Warnings**: Never suppress, always resolve
- **Consistent Style**: Match existing patterns
- **Comments**: Use sparingly for complex business logic rationale. Prefer clear function names over comments.
- **Metric Accuracy**: All metrics must be deterministic and reproducible across runs
- **Immutability**: Prefer immutable data structures, especially in the model layer
- **Backward Compatibility**: Changes to `.cc.json` format require careful versioning

**TDD Workflow** (Red → Green → Refactor):
1. Write one failing test
2. Write minimum code to pass
3. Run all tests (must be green)
4. Refactor if needed
5. Commit
6. Repeat

**Test Structure**: Always use Arrange-Act-Assert pattern with comments:
```typescript
test('should calculate total when cart has multiple items', () => {
  // Arrange
  const cart = new Cart();

  // Act
  const total = cart.getTotal();

  // Assert
  expect(total).toBe(30);
});
```

**Test Naming**: Always start with "should" (e.g., `should throw error when dividing by zero`)

**Tidy First**: Separate structural changes (rename, extract, move) from behavioral changes (features, fixes). Always commit structural changes first.

**Commit Discipline**: Only commit when all tests pass, all warnings resolved, and changes represent a single logical unit. Use small, frequent commits.

**Code Quality Checklist**:
- Eliminate duplication (3+ occurrences → extract)
- Keep methods small, single responsibility
- Make dependencies explicit
- Use simplest solution that works
- Prefer pure functions, minimize state

**Refactoring Rules**: Only when tests are green, one change at a time, run tests after each step.

**Avoid**:
- ❌ Committing with failing tests
- ❌ Mixing structural + behavioral changes
- ❌ Suppressing warnings
- ❌ Test names without "should"
- ❌ Tests without Arrange/Act/Assert comments

## Testing

### Analysis Tests

```bash
# Unit tests
./gradlew test

# Integration tests (golden tests)
./gradlew integrationTest

# Test specific class
./gradlew test --tests "ClassName"

# With coverage
./gradlew test jacocoTestReport
```

### Visualization Tests

```bash
# Unit tests (Jest)
npm test

# Watch mode
npm run test:auto

# Update snapshots
npm run test:updateSnaps

# E2E tests (Puppeteer)
npm run e2e

# E2E watch mode
npm run e2e:auto
```

**IntelliJ Jest Configuration**:
- Edit configuration templates → Jest
- Set config file: `jestUnit.config.json`
- Add Jest option: `--env=jsdom`

## Key File Locations

### Analysis
- Main CLI: `analysis/ccsh/src/main/kotlin/de/maibornwolff/codecharta/ccsh/Ccsh.kt`
- Parsers: `analysis/analysers/parsers/`
- Importers: `analysis/analysers/importers/`
- Filters: `analysis/analysers/filters/`
- Data model: `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/model/`
- Serialization: `analysis/model/src/main/kotlin/de/maibornwolff/codecharta/serialization/`

### Visualization
- Main component: `visualization/app/codeCharta/codeCharta.component.ts`
- State management: `visualization/app/codeCharta/state/`
- 3D rendering: `visualization/app/codeCharta/services/3DExports/`
- UI components: `visualization/app/codeCharta/ui/`
- Layout algorithms: `visualization/app/codeCharta/util/algorithm/`
- Model types: `visualization/app/codeCharta/codeCharta.model.ts`

## CI/CD (GitHub Actions)

Workflows in `.github/workflows/`:

- **test.yml**: Runs on every PR push
  - Unit and E2E tests
  - Sonar analysis (publishes to SonarCloud)

- **release-analysis.yml**: Analysis deployment
  - Publishes to npm
  - Deploys Docker container to Docker Hub

- **release-visualization.yml**: Visualization deployment
  - Deploys to GitHub Pages
  - Publishes to npm

## Common Patterns

### Analysis: Adding a New Parser

1. Create new module in `analysis/analysers/parsers/`
2. Implement `AnalyserInterface`
3. Implement `getDialog()` for interactive mode
4. Use `ProjectBuilder` to construct output
5. Register in `Ccsh.kt` via `@CommandLine.Command`
6. Add attribute generators to `AttributeGeneratorRegistry`
7. Write tests in `src/test/kotlin/`

### Visualization: Adding a New Setting

1. Define state interface in appropriate state slice
2. Create action in `*.actions.ts`
3. Add reducer case in `*.reducer.ts`
4. Create selector in `*.selector.ts`
5. Add effect if side effects needed
6. Update UI component to dispatch/subscribe

### Visualization: Modifying 3D Rendering

1. Update geometry generation in `GeometryGenerator`
2. Modify shaders if needed (`visualization/app/codeCharta/shaders/`)
3. Update `CodeMapMesh` or `CodeMapBuilding` for new visual features
4. Trigger re-render via `renderCodeMapEffect`

## Documentation

- User docs: https://maibornwolff.github.io/codecharta/
- Dev docs: In-repo README files
- ADRs: https://maibornwolff.github.io/codecharta/categories/#adr
- CCSH help: `ccsh -h` or `ccsh <command> -h`
- Analysis guide: `analysis/NEW_TO_ANALYSIS.md`

## Dependency Updates

- Renovate auto-merges non-major updates and security patches
- Manual review required if auto-merge fails
- Assign to developer after completing non-dependency work

## Docker

- Analysis Dockerfile: `analysis/Dockerfile`
- Visualization Dockerfile: `visualization/Dockerfile`
- Documentation: https://maibornwolff.github.io/codecharta/docs/docker-containers/
