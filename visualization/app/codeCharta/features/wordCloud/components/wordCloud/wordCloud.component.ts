import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    effect,
    inject,
    input,
    OnDestroy,
    signal,
    viewChild
} from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import * as echarts from "echarts"
import "echarts-wordcloud"
import { DomainWord } from "../../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape } from "../../../../model/wordCloud.model"
import { ViewReadinessStore } from "../../../../stores/viewReadiness/viewReadiness.store"
import { WordCloudReadStore } from "../../stores/wordCloud.read.store"
import { WordCloudWriteStore } from "../../stores/wordCloud.write.store"
import { buildWordCloudOption, CANVAS_FILL_RATIO, selectTopWords, WordCloudOption } from "../../util/wordCloudOption.builder"

// A resize is debounced so a drag-resize does not thrash the layout re-flow (echarts recomputes the
// whole word placement on resize).
const RESIZE_DEBOUNCE_MS = 100

/**
 * A re-render is debounced for the same reason, and for a sharper one: dragging a settings slider emits
 * a value on every pointer move, and echarts-wordcloud lays out ASYNCHRONOUSLY. Firing setOption again
 * while a previous layout is still running leaves both layouts' words painted, so the cloud visibly
 * accumulates overlapping words the longer a slider is dragged. Coalescing to one render per settle
 * keeps a single layout in flight at a time.
 */
const RENDER_DEBOUNCE_MS = 150

/** How many words the screen-reader alternative names explicitly; the rest are only counted. */
const SCREEN_READER_WORD_COUNT = 10
const ARIA_HEADLINE_WORD_COUNT = 3

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
    private readonly wordCloudWriteStore = inject(WordCloudWriteStore)
    private readonly viewReadinessStore = inject(ViewReadinessStore)

    readonly settings = input<WordCloudSettings>(defaultWordCloudSettings)

    /** Absent while the empty state is shown, so the chart is created and destroyed with the canvas. */
    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>("wordCloudCanvas")

    protected readonly words = toSignal(this.wordCloudReadStore.wordsForSelectedNode$, { initialValue: [] as DomainWord[] })
    protected readonly selectedNodeName = toSignal(this.wordCloudReadStore.selectedNodeName$, { initialValue: "" })

    /**
     * TEMPORARY diagnostic: outlines the region the layout is actually confined to, so the space the cloud
     * leaves unused is visible. Flip to false (or delete the overlay in the template) once the sizing is
     * settled — it is not meant to ship.
     */
    protected readonly showLayoutBounds = true
    protected readonly layoutAreaPercent = CANVAS_FILL_RATIO * 100
    /** `keepAspect: false` stretches a circular shape to an ellipse filling the box, so mirror that here. */
    protected readonly isEllipticalLayout = computed(() => this.settings().shape === WordCloudShape.circle)

    /** The words handed to the chart — ranked and truncated exactly as the canvas is. */
    private readonly renderedWords = computed(() => selectTopWords(this.words(), this.settings().sizingMode, this.settings().topN))

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
     * The measured container width, kept as a signal so the render effect re-runs on every resize. The max
     * font size is clamped against it, and `chart.resize()` alone would keep a clamp fitted to the OLD width
     * — echarts would then silently drop the largest (highest-ranked) word once the container narrows.
     */
    private readonly containerWidth = signal(0)
    private resizeObserver?: ResizeObserver
    private resizeTimeout?: ReturnType<typeof setTimeout>
    private renderTimeout?: ReturnType<typeof setTimeout>
    /** WCAG 2.3.3: with up to a few hundred words flying in on every rebuild, the layout animation is motion. */
    private readonly prefersReducedMotion = typeof matchMedia === "function" && matchMedia(REDUCED_MOTION_QUERY).matches

    constructor() {
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
            // Read AFTER the seeding initialization, so the first run already sees the measured width.
            const containerWidth = this.containerWidth()
            this.scheduleRender(
                buildWordCloudOption(words, settings, {
                    layoutAnimation: !this.prefersReducedMotion,
                    containerWidth
                })
            )
        })
    }

    ngOnDestroy(): void {
        this.disposeChart()
    }

    protected showWholeMap(): void {
        this.wordCloudWriteStore.clearSelectedBuilding()
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
        })
        this.containerWidth.set(container.clientWidth)
        this.observeResize(container)
    }

    private disposeChart(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        if (this.resizeTimeout !== undefined) {
            clearTimeout(this.resizeTimeout)
        }
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
        }
        this.chart?.dispose()
        this.chart = undefined
    }

    /** Coalesces a burst of settings/word changes into a single layout — see RENDER_DEBOUNCE_MS. */
    private scheduleRender(option: WordCloudOption): void {
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
        }
        this.renderTimeout = setTimeout(() => {
            this.renderTimeout = undefined
            // `clear()` drops the previous layout's painted words before the new one is laid out; without
            // it echarts-wordcloud keeps them, which is what makes repeated renders pile words up.
            this.chart?.clear()
            // The builder emits a deliberately narrow option shape (decoupled from the echarts runtime
            // types); bridge it to the echarts option at this single seam.
            this.chart?.setOption(option as unknown as echarts.EChartsCoreOption, true)
        }, RENDER_DEBOUNCE_MS)
    }

    private observeResize(container: HTMLElement): void {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.resizeTimeout !== undefined) {
                clearTimeout(this.resizeTimeout)
            }
            this.resizeTimeout = setTimeout(() => {
                this.chart?.resize()
                // Re-fits the font-size clamp to the new width by re-running the render effect.
                this.containerWidth.set(container.clientWidth)
            }, RESIZE_DEBOUNCE_MS)
        })
        this.resizeObserver.observe(container)
    }
}
