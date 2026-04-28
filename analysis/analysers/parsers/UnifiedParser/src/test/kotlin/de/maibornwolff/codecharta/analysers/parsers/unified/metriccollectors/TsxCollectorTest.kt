package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class TsxCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.TSX)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".tsx")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    private fun collectMetrics(content: String): Map<String, Any> = collector.collectMetricsForFile(createTestFile(content)).attributes

    private fun assertMetric(content: String, metric: String, expected: Double) {
        assertThat(collectMetrics(content)[metric] as Double).isEqualTo(expected)
    }

    private fun assertMetrics(content: String, vararg expectations: Pair<String, Double>) {
        val metrics = collectMetrics(content)
        expectations.forEach { (metric, expected) ->
            assertThat(metrics[metric] as Double).isEqualTo(expected)
        }
    }

    // --- Function counting tests ---

    @Test
    fun `should count functional component with JSX for number of functions`() {
        val content = """
            import React from 'react';

            const MyComponent: React.FC = () => {
                return <div>Hello World</div>;
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName, 1.0)
    }

    @Test
    fun `should count function component with typed props for number of functions`() {
        val content = """
            interface Props {
                name: string;
                age: number;
            }

            function UserCard({ name, age }: Props) {
                return (
                    <div className="user-card">
                        <h2>{name}</h2>
                        <p>Age: {age}</p>
                    </div>
                );
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName, 1.0)
    }

    @Test
    fun `should count class component with render method for number of functions`() {
        assertMetric(
            "class Counter extends Component { render() { return <div />; } }",
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName,
            1.0
        )
    }

    @Test
    fun `should not count inline arrow function in JSX prop as a function`() {
        val content = """
            function App() {
                return (<Button onClick={() => doStuff()} />);
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName, 1.0)
    }

    @Test
    fun `should not count map callback returning JSX as a function`() {
        val content = """
            function List({ items }) {
                return (<ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>);
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName, 1.0)
    }

    // --- Complexity tests ---

    @Test
    fun `should count complexity with JSX ternary operators`() {
        val content = """
            const ConditionalComponent: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
                return (
                    <div>
                        {isLoading ? <Spinner /> : <Content />}
                    </div>
                );
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.COMPLEXITY.metricName, 2.0)
    }

    @Test
    fun `should count complexity with JSX logical AND operators`() {
        val content = """
            const OptionalComponent = ({ showMessage }: { showMessage: boolean }) => {
                return (
                    <div>
                        {showMessage && <p>Message is visible</p>}
                        {!showMessage && <p>Message is hidden</p>}
                    </div>
                );
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.COMPLEXITY.metricName, 3.0)
    }

    @Test
    fun `should count complexity with multiple conditional renders`() {
        val content = """
            const StatusDisplay = ({ status }: { status: string }) => {
                if (status === 'loading') {
                    return <Spinner />;
                } else if (status === 'error') {
                    return <Error />;
                } else if (status === 'success') {
                    return <Success />;
                }
                return <Idle />;
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.COMPLEXITY.metricName, 4.0)
    }

    @Test
    fun `should count complexity with switch statement for JSX rendering`() {
        val content = """
            const SwitchComponent = ({ type }: { type: string }) => {
                switch (type) {
                    case 'primary':
                        return <PrimaryButton />;
                    case 'secondary':
                        return <SecondaryButton />;
                    case 'danger':
                        return <DangerButton />;
                    default:
                        return <DefaultButton />;
                }
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.COMPLEXITY.metricName, 5.0)
    }

    @Test
    fun `should count hook usage with complexity`() {
        val content = """
            const HookComponent = () => {
                const [count] = useState(0);

                useEffect(() => {
                    if (count > 10) {
                        doSomething();
                    }
                }, [count]);

                return <div>{count}</div>;
            }
        """.trimIndent()
        // complexity=3: outer function (1) + useEffect arrow callback (1) + if inside callback (1)
        assertMetrics(
            content,
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName to 1.0,
            AvailableFileMetrics.COMPLEXITY.metricName to 3.0
        )
    }

    @Test
    fun `should count generic function component`() {
        assertMetric(
            "function List<T>(items: T[]) { return <ul />; }",
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName,
            1.0
        )
    }

    @Test
    fun `should count JSX with event handlers for complexity`() {
        val content = """
            const Form = () => {
                const handleSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (isValid()) {
                        submit();
                    }
                };

                const isValid = () => {
                    return name.length > 0 && email.includes('@');
                };

                return (
                    <form onSubmit={handleSubmit}>
                        <input type="text" />
                        <button type="submit">Submit</button>
                    </form>
                );
            }
        """.trimIndent()
        assertMetrics(
            content,
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName to 3.0,
            AvailableFileMetrics.COMPLEXITY.metricName to 5.0
        )
    }

    // --- Comment and LOC tests ---

    @Test
    fun `should count JSX comments and TypeScript comments for comment_lines`() {
        val content = """
            /**
             * This is a JSDoc comment
             * describing the component
             */
            const CommentedComponent = () => {
                // This is a line comment
                return (
                    <div>
                        {/* This is a JSX comment */}
                        <p>Hello</p>
                        {/* Another JSX comment
                            spanning multiple lines */}
                    </div>
                );
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.COMMENT_LINES.metricName, 8.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc with JSX`() {
        val content = """
            const Component = () => {
                // comment


                return <div>Content</div>;
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.REAL_LINES_OF_CODE.metricName, 3.0)
    }

    @Test
    fun `should count lines of code including JSX for loc`() {
        val content = """
            const Component = () => {
                // comment


                return <div>Content</div>;
            }
        """.trimIndent() + "\n"
        assertMetric(content, AvailableFileMetrics.LINES_OF_CODE.metricName, 6.0)
    }

    @Test
    fun `should handle nested JSX elements with complex structure`() {
        val content = """
            const NestedComponent = ({ items }: { items: string[] }) => {
                return (
                    <div className="container">
                        <header>
                            <h1>Title</h1>
                            <nav>
                                {items.length > 0 && (
                                    <ul>
                                        {items.map((item, idx) => (
                                            <li key={idx}>
                                                <a href={`#${'$'}{item}`}>{item}</a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </nav>
                        </header>
                    </div>
                );
            }
        """.trimIndent()
        assertMetrics(
            content,
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName to 1.0,
            AvailableFileMetrics.COMPLEXITY.metricName to 3.0
        )
    }

    // --- Per-function distribution tests ---

    @Test
    fun `should count parameters correctly for React components`() {
        val content = """
            function NoProps() { return <div />; }
            function OneParam(a: string) { return <div />; }
            function TwoParams(a: string, b: number) { return <div />; }
            function ThreeParams(a: string, b: number, c: boolean) { return <div />; }
        """.trimIndent()
        assertMetrics(
            content,
            "max_parameters_per_function" to 3.0,
            "min_parameters_per_function" to 0.0,
            "mean_parameters_per_function" to 1.5,
            "median_parameters_per_function" to 1.5
        )
    }

    @Test
    fun `should correctly calculate complexity per function with JSX conditionals`() {
        val content = """
            function NoComplexity() {
                return <div>Simple</div>;
            }

            function WithConditionals({ show, isAdmin }: { show: boolean; isAdmin: boolean }) {
                return (
                    <div>
                        {show && <Content />}
                        {isAdmin ? <AdminPanel /> : <UserPanel />}
                    </div>
                );
            }

            function WithLoop({ items }: { items: string[] }) {
                for (const item of items) {
                    console.log(item);
                }
                return <ul>{items.map(i => <li>{i}</li>)}</ul>;
            }
        """.trimIndent()
        assertMetrics(
            content,
            "max_complexity_per_function" to 2.0,
            "min_complexity_per_function" to 0.0,
            "mean_complexity_per_function" to 1.33,
            "median_complexity_per_function" to 2.0
        )
    }

    @Test
    fun `should not count function type in interface property as a function`() {
        val content = """
            interface ButtonProps {
                onClick: () => void;
            }
            const Button = ({ onClick }: ButtonProps) => <button onClick={onClick} />;
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName, 1.0)
    }

    @Test
    fun `should count nullish coalescing in JSX expressions for complexity`() {
        val content = """
            const Component = ({ value }: { value?: string }) => {
                return <div>{value ?? 'Default Value'}</div>;
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.COMPLEXITY.metricName, 2.0)
    }

    @Test
    fun `should correctly calculate rloc per function with JSX`() {
        val content = """
            const SmallComponent = () => {
                return <div>Small</div>;
            }

            const MediumComponent = () => {
                // comment
                const value = 42;
                return <div>{value}</div>;
            }

            const LargeComponent = () => {
                const [state, setState] = useState(0);

                useEffect(() => {
                    setState(1);
                }, []);

                return (
                    <div>
                        {state}
                    </div>
                );
            }
        """.trimIndent()
        assertMetrics(
            content,
            "max_rloc_per_function" to 9.0,
            "min_rloc_per_function" to 1.0,
            "mean_rloc_per_function" to 4.0,
            "median_rloc_per_function" to 2.0
        )
    }

    // --- Misc metrics tests ---

    @Test
    fun `should count logic_complexity without function definitions unlike complexity`() {
        val content = """
            const Component = ({ show }: { show: boolean }) => {
                if (show) return <div />;
                return null;
            }
        """.trimIndent()
        // complexity counts the function definition (+1) and the if (+1) = 2
        // logic_complexity counts only control flow, not function definitions = 1
        assertMetrics(
            content,
            AvailableFileMetrics.COMPLEXITY.metricName to 2.0,
            AvailableFileMetrics.LOGIC_COMPLEXITY.metricName to 1.0
        )
    }

    @Test
    fun `should detect message chain in JSX component`() {
        val content = """
            const Component = () => {
                const result = items.filter(x => x > 0).map(x => x * 2).reduce((a, b) => a + b, 0).toString();
                return <div>{result}</div>;
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.MESSAGE_CHAINS.metricName, 1.0)
    }

    @Test
    fun `should detect long method in TSX component`() {
        val content = """
            const LongComponent = () => {
                const a = 1;
                const b = 2;
                const c = 3;
                const d = 4;
                const e = 5;
                const f = 6;
                const g = 7;
                const h = 8;
                const i = 9;
                const j = 10;
                const k = 11;
                return <div />;
            }
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.LONG_METHOD.metricName, 1.0)
    }

    @Test
    fun `should detect long parameter list in TSX function`() {
        assertMetric(
            "function ManyParams(a: string, b: number, c: boolean, d: string, e: number) { return <div />; }",
            AvailableFileMetrics.LONG_PARAMETER_LIST.metricName,
            1.0
        )
    }

    @Test
    fun `should detect excessive comments in TSX file`() {
        val content = """
            // Comment 1
            // Comment 2
            // Comment 3
            // Comment 4
            // Comment 5
            // Comment 6
            // Comment 7
            // Comment 8
            // Comment 9
            // Comment 10
            // Comment 11
            const Component = () => <div />;
        """.trimIndent()
        assertMetric(content, AvailableFileMetrics.EXCESSIVE_COMMENTS.metricName, 1.0)
    }

    @Test
    fun `should calculate comment ratio for TSX file`() {
        val content = """
            // Comment 1
            // Comment 2
            const Component = () => {
                const a = 1;
                const b = 2;
                const c = 3;
                const d = 4;
                const e = 5;
                return <div />;
            }
        """.trimIndent()
        // comment_lines=2, rloc=8 → ratio=0.25
        assertMetric(content, AvailableFileMetrics.COMMENT_RATIO.metricName, 0.25)
    }

    @Test
    fun `should handle complex JSX with multiple conditional rendering patterns`() {
        val content = """
            const ComplexComponent = ({
                isLoading,
                hasError,
                data
            }: {
                isLoading: boolean;
                hasError: boolean;
                data: string[] | null
            }) => {
                if (isLoading) return <Spinner />;
                if (hasError) return <Error />;
                if (!data) return null;

                return (
                    <div>
                        {data.length > 0 ? (
                            <ul>
                                {data.map((item, idx) => (
                                    <li key={idx}>
                                        {item.length > 10 ? item.substring(0, 10) + '...' : item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No data available</p>
                        )}
                    </div>
                );
            }
        """.trimIndent()
        assertMetrics(
            content,
            AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName to 1.0,
            AvailableFileMetrics.COMPLEXITY.metricName to 7.0
        )
    }
}
