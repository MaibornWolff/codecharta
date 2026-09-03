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
import { switchMap } from "rxjs"
import { DomainWord } from "../../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape } from "../../../../model/wordCloud.model"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { WordCloudChartRegistry } from "../../services/wordCloudChart.registry"
import { WordCloudReadStore } from "../../stores/wordCloud.read.store"
import { selectTopWords } from "../../util/topWords"
import { loadWordCloudMaskImage } from "../../util/wordCloudMask"
import { buildWordCloudOption } from "../../util/wordCloudOption.builder"
import { WordCloudChartHost } from "./wordCloudChartHost"
import { describeDroppedWords, describeWordCloud, SCREEN_READER_WORD_COUNT } from "./wordCloudDescription"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export interface RightClickedWord {
    word: string
    clientX: number
    clientY: number
}

interface WordCloudRenderInputs {
    container: HTMLElement
    words: DomainWord[]
    settings: WordCloudSettings
    maskImage: HTMLImageElement | undefined
    containerWidth: number
    containerHeight: number
}

/** Leaving the view detaches its DOM, which measures as a zero-sized container and measures back to
 * the old size on return. The canvas keeps the cloud it already drew, so re-laying it out for the
 * very same inputs would only replay the animation — unless the container itself was replaced, which
 * takes the drawn cloud with it. Compared against what actually reached the chart, never against a
 * layout that was merely queued. */
function isSameRender(previous: WordCloudRenderInputs | null, next: WordCloudRenderInputs): boolean {
    return (
        previous !== null &&
        previous.container === next.container &&
        previous.words === next.words &&
        previous.settings === next.settings &&
        previous.maskImage === next.maskImage &&
        previous.containerWidth === next.containerWidth &&
        previous.containerHeight === next.containerHeight
    )
}

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

    readonly selectedNodePath = input<string | null>(null)

    /** The word whose occurrences the explorer is showing; the cloud marks it so both say the same thing. */
    readonly inspectedWord = input<string | null>(null)

    readonly clearSelection = output<void>()

    readonly wordRightClicked = output<RightClickedWord>()

    readonly wordClicked = output<string>()

    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>("wordCloudCanvas")

    private readonly chartHost = new WordCloudChartHost(inject(WordCloudChartRegistry), {
        onLayoutFinished: () => this.viewReadinessStore.markReady("domain"),
        onWordRightClicked: (word, clientX, clientY) => this.wordRightClicked.emit({ word, clientX, clientY }),
        onWordClicked: word => this.wordClicked.emit(word)
    })

    protected readonly words = toSignal(
        toObservable(this.selectedNodePath).pipe(switchMap(path => this.wordCloudReadStore.wordsForSelectedNode(path))),
        { initialValue: [] as DomainWord[] }
    )
    protected readonly selectedNodeName = computed(() => this.wordCloudReadStore.selectedNodeName(this.selectedNodePath()))

    private readonly renderedWords = computed(() => selectTopWords(this.words(), this.settings().sizingMode, this.settings().topN))

    protected readonly droppedWordNotice = computed(() =>
        describeDroppedWords(this.chartHost.drawnWordCount(), this.renderedWords().length)
    )

    protected readonly topWordsForScreenReaders = computed(() => this.renderedWords().slice(0, SCREEN_READER_WORD_COUNT))

    protected readonly description = computed(() => describeWordCloud(this.renderedWords(), this.selectedNodeName()))

    private readonly prefersReducedMotion = typeof matchMedia === "function" && matchMedia(REDUCED_MOTION_QUERY).matches

    private readonly maskImage = signal<HTMLImageElement | null>(null)

    private lastRenderedInputs: WordCloudRenderInputs | null = null

    constructor() {
        this.loadMaskImageAndKeepCircleFallbackOnFailure()
        effect(() => this.renderIntoTheChartOnceTheContainerIsMeasured())
        effect(() => this.chartHost.highlightWord(this.inspectedWord()))
    }

    ngOnDestroy(): void {
        this.disposeChart()
    }

    /** Disposing drops the drawn cloud and cancels a render that was still debounced, so nothing that
     * was skippable before it stays skippable after. */
    private disposeChart(): void {
        this.chartHost.dispose()
        this.lastRenderedInputs = null
    }

    protected showWholeMap(): void {
        this.clearSelection.emit()
    }

    private renderIntoTheChartOnceTheContainerIsMeasured(): void {
        const words = this.words()
        const settings = this.settings()
        const maskImage = settings.shape === WordCloudShape.logoM ? (this.maskImage() ?? undefined) : undefined
        const container = this.canvasRef()?.nativeElement
        if (!container) {
            this.disposeChart()
            this.viewReadinessStore.markReady("domain")
            return
        }
        this.chartHost.attachTo(container)
        const { width: containerWidth, height: containerHeight } = this.chartHost.containerSize()
        if (containerWidth === 0 || containerHeight === 0) {
            // A queued layout would land on the detached container and wipe the cloud drawn for the
            // size this view still comes back to.
            this.chartHost.cancelPendingRender()
            return
        }
        const inputs: WordCloudRenderInputs = { container, words, settings, maskImage, containerWidth, containerHeight }
        if (isSameRender(this.lastRenderedInputs, inputs)) {
            this.viewReadinessStore.markReady("domain")
            return
        }
        this.chartHost.render(
            buildWordCloudOption(words, settings, {
                layoutAnimation: !this.prefersReducedMotion,
                containerWidth,
                maskImage
            }),
            () => {
                this.lastRenderedInputs = inputs
            }
        )
    }

    private loadMaskImageAndKeepCircleFallbackOnFailure(): void {
        loadWordCloudMaskImage()
            .then(image => this.maskImage.set(image))
            .catch(() => undefined)
    }
}
