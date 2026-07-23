import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    signal,
    viewChild
} from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import * as echarts from "echarts"
import "echarts-wordcloud"
import { switchMap } from "rxjs"
import { DomainWord } from "../../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape } from "../../../../model/wordCloud.model"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { WordCloudReadStore } from "../../stores/wordCloud.read.store"
import { loadWordCloudMaskImage } from "../../util/wordCloudMask"
import { buildWordCloudOption, selectTopWords, WordCloudOption } from "../../util/wordCloudOption.builder"

/**
 * Every path that changes the canvas — words, settings AND resizes — funnels through this one debounce,
 * so a burst produces exactly one layout.
 *
 * It has to be a single path: dragging a settings slider emits a value on every pointer move, and
 * echarts-wordcloud lays out ASYNCHRONOUSLY. Firing setOption again while a previous layout is still
 * running leaves both layouts' words painted, so the cloud visibly accumulates overlapping words the
 * longer a slider is dragged. Coalescing to one render per settle keeps a single layout in flight.
 *
 * Resizes used to run their own debounce that called `chart.resize()` directly, which laid the cloud out
 * once, and then re-ran this render for the re-fitted font clamp, which laid it out AGAIN — the visible
 * double render on a window/sidebar resize and on returning to the kept-alive domain view.
 */
const RENDER_DEBOUNCE_MS = 150

/** How many words the screen-reader alternative names explicitly; the rest are only counted. */
const SCREEN_READER_WORD_COUNT = 10
const ARIA_HEADLINE_WORD_COUNT = 3

/**
 * echarts fires `finished` repeatedly while the asynchronous word layout is still placing words, so the
 * drawn-word count is only published once the events have been quiet for this long — otherwise the
 * "N of M words fit" notice would count up visibly during every layout.
 */
const DRAWN_COUNT_SETTLE_MS = 200

/**
 * The private echarts surface the drawn-word count is read from. The layout gives a graphic element only
 * to words it actually placed (see echarts-wordcloud WordCloudView `ondraw`), so counting the elements is
 * the only way to learn how many words survived — the layout drops the rest silently, and no public API
 * or event reports it.
 */
interface EchartsWithModel {
    getModel?: () => {
        getSeriesByIndex: (
            index: number
        ) => { getData: () => { count: () => number; getItemGraphicEl: (index: number) => unknown } } | undefined
    }
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/**
 * Renders the selected node's domain words as an ECharts word cloud. The renderer is settings-agnostic:
 * the composing view binds the domain-bar settings into the `settings` input, so the cloud stays a
 * reusable presentational component. The container must be sized by its host (the routed domain view
 * gives it an explicit height); the chart initializes after the view is laid out and resizes with it.
 */
@Component({
    selector: "cc-word-cloud",
    templateUrl: "./wordCloud.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    host: { class: "relative block h-full w-full" }
})
export class WordCloudComponent implements OnDestroy {
    private readonly wordCloudReadStore = inject(WordCloudReadStore)
    private readonly viewReadinessStore = inject(ViewReadinessStore)

    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)

    /** The node whose words to show, supplied by the composing view that owns the selection (null = root). */
    readonly selectedNodePath = input<string | null>(null)

    /** Raised by the empty state's "Show whole map" button — the owning view clears its selection. */
    readonly clearSelection = output<void>()

    /** Absent while the empty state is shown, so the chart is created and destroyed with the canvas. */
    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>("wordCloudCanvas")

    protected readonly words = toSignal(
        toObservable(this.selectedNodePath).pipe(switchMap(path => this.wordCloudReadStore.wordsForSelectedNode(path))),
        { initialValue: [] as DomainWord[] }
    )
    protected readonly selectedNodeName = computed(() => this.wordCloudReadStore.selectedNodeName(this.selectedNodePath()))

    /** The words handed to the chart — ranked and truncated exactly as the canvas is. */
    private readonly renderedWords = computed(() => selectTopWords(this.words(), this.settings().sizingMode, this.settings().topN))

    /** How many of the requested words the layout actually placed; null while a layout is in flight. */
    private readonly drawnWordCount = signal<number | null>(null)

    /** Names the ways out because each maps to a control the user can reach from the domain bar. */
    protected readonly droppedWordNotice = computed(() => {
        const drawn = this.drawnWordCount()
        const requested = this.renderedWords().length
        if (drawn === null || drawn >= requested) {
            return null
        }
        return `${drawn} of ${requested} words fit — enlarge the window, reduce word spacing, or enable "Fit all words" or "Draw outside bounds"`
    })

    protected readonly topWordsForScreenReaders = computed(() => this.renderedWords().slice(0, SCREEN_READER_WORD_COUNT))

    protected readonly ariaLabel = computed(() => {
        const leadingWords = this.topWordsForScreenReaders()
            .slice(0, ARIA_HEADLINE_WORD_COUNT)
            .map(word => word.text)
            .join(", ")
        const wordCount = this.renderedWords().length
        const termLabel = wordCount === 1 ? "domain term" : "domain terms"
        return `Word cloud of ${wordCount} ${termLabel} for ${this.selectedNodeName()}; largest: ${leadingWords}`
    })

    private chart?: echarts.ECharts
    /**
     * The measured container box, kept as a signal so the render effect re-runs on every resize. The max
     * font size is clamped against the width, and a `chart.resize()` alone would keep a clamp fitted to the
     * OLD width — echarts would then silently drop the largest (highest-ranked) word once the container
     * narrows. The height is tracked too: it does not feed the clamp, but a height-only change (collapsing
     * a bar above the cloud) still needs the layout re-run that a width-only signal would skip.
     */
    private readonly containerSize = signal({ width: 0, height: 0 }, { equal: (a, b) => a.width === b.width && a.height === b.height })
    private resizeObserver?: ResizeObserver
    private renderTimeout?: ReturnType<typeof setTimeout>
    private drawnCountTimeout?: ReturnType<typeof setTimeout>
    /** WCAG 2.3.3: with up to a few hundred words flying in on every rebuild, the layout animation is motion. */
    private readonly prefersReducedMotion = typeof matchMedia === "function" && matchMedia(REDUCED_MOTION_QUERY).matches

    /**
     * The "M" mask silhouette, loaded once. Null until it resolves — the builder falls back to a circle in the
     * meantime, and setting this signal re-runs the render effect so the mask takes over as soon as it is ready.
     */
    private readonly maskImage = signal<HTMLImageElement | null>(null)

    constructor() {
        loadWordCloudMaskImage()
            .then(image => this.maskImage.set(image))
            .catch(() => {
                // The mask is a data-URI SVG, so a failure means the environment has no image rasterization
                // (e.g. a test DOM); the cloud simply keeps its circle fallback.
            })

        effect(() => {
            const words = this.words()
            const settings = this.settings()
            const container = this.canvasRef()?.nativeElement
            if (!container) {
                this.disposeChart()
                // The empty state is the finished content for a node without words — there is no layout
                // to wait for, so the view is ready as soon as it is on screen.
                this.viewReadinessStore.markReady("domain")
                return
            }
            this.initializeChart(container)
            // Read AFTER the seeding initialization, so the first run already sees the measured box.
            const { width: containerWidth, height: containerHeight } = this.containerSize()
            // A view that is off screen — a kept-alive route mid-detach, or one mounted before layout has
            // run — measures 0x0. Laying out into that produces a zero-sized canvas that would only have to
            // be redone, so wait instead: the observer republishes the moment there is a real box, and this
            // effect re-runs then. Readiness is deliberately NOT signalled here; the cloud genuinely is not
            // on screen yet, and the "finished" handler still owns that.
            if (containerWidth === 0 || containerHeight === 0) {
                return
            }
            this.scheduleRender(
                buildWordCloudOption(words, settings, {
                    layoutAnimation: !this.prefersReducedMotion,
                    containerWidth,
                    maskImage: settings.shape === WordCloudShape.logoM ? (this.maskImage() ?? undefined) : undefined
                })
            )
        })
    }

    ngOnDestroy(): void {
        this.disposeChart()
    }

    protected showWholeMap(): void {
        this.clearSelection.emit()
    }

    private initializeChart(container: HTMLElement): void {
        if (this.chart) {
            return
        }
        this.chart = echarts.init(container)
        // echarts-wordcloud lays out asynchronously, so the cloud is only actually on screen once echarts
        // reports the render finished. That is what the domain view's spinner waits for.
        this.chart.on("finished", () => {
            this.viewReadinessStore.markReady("domain")
            this.scheduleDrawnCountUpdate()
        })
        this.containerSize.set({ width: container.clientWidth, height: container.clientHeight })
        this.observeResize(container)
    }

    private disposeChart(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
        }
        if (this.drawnCountTimeout !== undefined) {
            clearTimeout(this.drawnCountTimeout)
        }
        this.drawnWordCount.set(null)
        this.chart?.dispose()
        this.chart = undefined
    }

    /** Publishes the drawn-word count once the layout has settled — see DRAWN_COUNT_SETTLE_MS. */
    private scheduleDrawnCountUpdate(): void {
        if (this.drawnCountTimeout !== undefined) {
            clearTimeout(this.drawnCountTimeout)
        }
        this.drawnCountTimeout = setTimeout(() => {
            this.drawnCountTimeout = undefined
            this.drawnWordCount.set(this.countDrawnWords())
        }, DRAWN_COUNT_SETTLE_MS)
    }

    private countDrawnWords(): number | null {
        const data = (this.chart as unknown as EchartsWithModel | undefined)?.getModel?.()?.getSeriesByIndex(0)?.getData()
        if (!data) {
            return null
        }
        let drawnCount = 0
        for (let index = 0; index < data.count(); index++) {
            if (data.getItemGraphicEl(index)) {
                drawnCount++
            }
        }
        return drawnCount
    }

    /** Coalesces a burst of settings/word changes into a single layout — see RENDER_DEBOUNCE_MS. */
    private scheduleRender(option: WordCloudOption): void {
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
        }
        this.renderTimeout = setTimeout(() => {
            this.renderTimeout = undefined
            // A fresh layout is starting, so the previous drawn count no longer describes the canvas.
            this.drawnWordCount.set(null)
            // `clear()` drops the previous layout's painted words before the new one is laid out; without
            // it echarts-wordcloud keeps them, which is what makes repeated renders pile words up.
            this.chart?.clear()
            // Re-measures the container, which setOption alone does not do — echarts keeps the box it was
            // initialized with. Ordered AFTER clear() deliberately: resizing a POPULATED chart runs a full
            // word placement that the setOption below immediately throws away, and that discarded layout is
            // the second of the two renders this method now replaces with one.
            this.chart?.resize()
            // The builder emits a deliberately narrow option shape (decoupled from the echarts runtime
            // types); bridge it to the echarts option at this single seam.
            this.chart?.setOption(option as unknown as echarts.EChartsCoreOption, true)
        }, RENDER_DEBOUNCE_MS)
    }

    /**
     * Publishes the measured box and nothing more — the render effect turns that into the single debounced
     * layout. The observer deliberately does not touch the chart itself.
     */
    private observeResize(container: HTMLElement): void {
        // EVERY measurement is published, including a 0x0 one from an off-screen view. Swallowing those
        // instead would latch the last on-screen size, and the box measured on the way back in would then
        // compare equal to it — no change, no re-layout, and the canvas stays at whatever size it was
        // initialized with. The render effect, not this observer, decides that 0x0 is not worth laying out.
        this.resizeObserver = new ResizeObserver(() => {
            this.containerSize.set({ width: container.clientWidth, height: container.clientHeight })
        })
        this.resizeObserver.observe(container)
    }
}
