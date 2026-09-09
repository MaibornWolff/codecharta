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
import { loadMaskImage, WORD_CLOUD_M_MASK_DATA_URI } from "../../util/wordCloudMask"
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

    /** The shape to lay the words out inside, as a data URI, while the custom shape is picked. */
    readonly customShapeMask = input<string | null>(null)

    /** The words the explorer is pointing at — the one it broke down and the ones its search matched.
     * The cloud marks them so both say the same thing. */
    readonly markedWords = input<readonly string[]>([])

    readonly clearSelection = output<void>()

    /** A click on the cloud beside every word, which lets go of what a click picked out. */
    readonly backgroundClicked = output<void>()

    readonly wordRightClicked = output<RightClickedWord>()

    readonly wordClicked = output<string>()

    private readonly canvasRef = viewChild<ElementRef<HTMLElement>>("wordCloudCanvas")

    private readonly chartHost = new WordCloudChartHost(inject(WordCloudChartRegistry), {
        onLayoutFinished: () => this.viewReadinessStore.markReady("domain"),
        onWordRightClicked: (word, clientX, clientY) => this.wordRightClicked.emit({ word, clientX, clientY }),
        onWordClicked: word => this.wordClicked.emit(word),
        onBackgroundClicked: () => this.backgroundClicked.emit()
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

    private readonly logoMaskImage = signal<HTMLImageElement | null>(null)
    private readonly customMaskImage = signal<HTMLImageElement | null>(null)

    private lastRenderedInputs: WordCloudRenderInputs | null = null

    constructor() {
        this.loadTheLogoMaskAndKeepTheCircleFallbackOnFailure()
        effect(() => this.loadTheUploadedShapeAndKeepTheCircleFallbackOnFailure())
        effect(() => this.renderIntoTheChartOnceTheContainerIsMeasured())
        effect(() => this.chartHost.highlightWords(this.markedWords()))
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

    /** The button sits inside the empty state, whose own clicks let a word go; only one of the two can
     * answer a click on it. */
    protected showWholeMap(event: MouseEvent): void {
        event.stopPropagation()
        this.clearSelection.emit()
    }

    private renderIntoTheChartOnceTheContainerIsMeasured(): void {
        const words = this.words()
        const settings = this.settings()
        const maskImage = this.maskImageFor(settings.shape)
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

    /** A shape laid out inside a mask falls back to a plain circle while its mask is missing — because
     * it is still loading, because it failed to, or because an uploaded one did not survive a reload. */
    private maskImageFor(shape: WordCloudShape): HTMLImageElement | undefined {
        if (shape === WordCloudShape.logoM) {
            return this.logoMaskImage() ?? undefined
        }
        if (shape === WordCloudShape.custom) {
            return this.customMaskImage() ?? undefined
        }
        return undefined
    }

    private loadTheLogoMaskAndKeepTheCircleFallbackOnFailure(): void {
        loadMaskImage(WORD_CLOUD_M_MASK_DATA_URI)
            .then(image => this.logoMaskImage.set(image))
            .catch(() => undefined)
    }

    private loadTheUploadedShapeAndKeepTheCircleFallbackOnFailure(): void {
        const dataUri = this.customShapeMask()
        if (dataUri === null) {
            this.customMaskImage.set(null)
            return
        }
        loadMaskImage(dataUri)
            .then(image => this.customMaskImage.set(image))
            .catch(() => this.customMaskImage.set(null))
    }
}
