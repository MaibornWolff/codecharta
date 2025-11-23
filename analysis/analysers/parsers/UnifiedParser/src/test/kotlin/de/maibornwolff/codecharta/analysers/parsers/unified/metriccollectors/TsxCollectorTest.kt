package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterTypescript
import java.io.File

class TsxCollectorTest {
    private var parser = TSParser()
    private val collector = TypescriptCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterTypescript())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".tsx")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count functional component with JSX for number of functions`() {
        // Arrange
        val fileContent = """
            import React from 'react';

            const MyComponent: React.FC = () => {
                return <div>Hello World</div>;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count function component with typed props for number of functions`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count class component with render method for number of functions`() {
        // Arrange
        val fileContent = """
            import React, { Component } from 'react';

            interface State {
                count: number;
            }

            class Counter extends Component<{}, State> {
                constructor(props: {}) {
                    super(props);
                    this.state = { count: 0 };
                }

                increment() {
                    this.setState({ count: this.state.count + 1 });
                }

                render() {
                    return (
                        <div>
                            <p>Count: {this.state.count}</p>
                            <button onClick={() => this.increment()}>Increment</button>
                        </div>
                    );
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count complexity with JSX ternary operators`() {
        // Arrange
        val fileContent = """
            const ConditionalComponent: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
                return (
                    <div>
                        {isLoading ? <Spinner /> : <Content />}
                    </div>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0) //TODO not counting ternary in div
    }

    @Test
    fun `should count complexity with JSX logical AND operators`() {
        // Arrange
        val fileContent = """
            const OptionalComponent = ({ showMessage }: { showMessage: boolean }) => {
                return (
                    <div>
                        {showMessage && <p>Message is visible</p>}
                        {!showMessage && <p>Message is hidden</p>}
                    </div>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0) //TODO: correctly counts && even within errors
    }

    @Test
    fun `should count complexity with multiple conditional renders`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count complexity with switch statement for JSX rendering`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(5.0) //TODO: parsing of switch statements is incorrect after first <
    }

    @Test
    fun `should count JSX with fragments and multiple children`() {
        // Arrange
        val fileContent = """
            const FragmentComponent = () => {
                return (
                    <>
                        <Header />
                        <main>
                            <Content />
                        </main>
                        <Footer />
                    </>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count hook usage with complexity`() {
        // Arrange
        val fileContent = """
            import { useState, useEffect } from 'react';

            const HookComponent = () => {
                const [count, setCount] = useState(0);
                const [data, setData] = useState<string | null>(null);

                useEffect(() => {
                    if (count > 10) {
                        fetchData();
                    }
                }, [count]);

                const fetchData = async () => {
                    try {
                        const response = await fetch('/api/data');
                        setData(await response.text());
                    } catch (error) {
                        console.error(error);
                    }
                };

                return <div>{data ?? 'Loading...'}</div>;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(3.0) //TODO: directly after the import statement is an error node and everything after is wonky
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count generic component with TypeScript types`() {
        // Arrange
        val fileContent = """
            interface ListProps<T> {
                items: T[];
                renderItem: (item: T) => React.ReactNode;
            }

            function List<T>({ items, renderItem }: ListProps<T>) {
                return (
                    <ul>
                        {items.map((item, index) => (
                            <li key={index}>{renderItem(item)}</li>
                        ))}
                    </ul>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count JSX with event handlers for complexity`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(5.0)
    }

    @Test
    fun `should count JSX comments and TypeScript comments for comment_lines`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(8.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc with JSX`() {
        // Arrange
        val fileContent = """
            const Component = () => {
                // comment


                return <div>Content</div>;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count lines of code including JSX for loc`() {
        // Arrange
        val fileContent = """
            const Component = () => {
                // comment


                return <div>Content</div>;
            }
        """.trimIndent() + "\n"
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(6.0)
    }

    @Test
    fun `should handle nested JSX elements with complex structure`() {
        // Arrange
        val fileContent = $$"""
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
                                                <a href={`#${item}`}>{item}</a>
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(3.0) //TODO: complexity within nesting not counted
    }

    @Test
    fun `should count parameters correctly for React components`() {
        // Arrange
        val fileContent = """
            function NoProps() {
                return <div>No props</div>;
            }

            function OneParam({ title }: { title: string }) {
                return <h1>{title}</h1>;
            }

            function TwoParams({ name, age }: { name: string; age: number }) {
                return <div>{name} is {age}</div>;
            }

            function ThreeParams({ x, y, z }: { x: number; y: number; z: number }) {
                return <div>{x + y + z}</div>;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_parameters_per_function"]).isEqualTo(0.5)
        Assertions.assertThat(result.attributes["median_parameters_per_function"]).isEqualTo(0.5) //TODO: does not correctly count multiple react parameters
    }

    @Test
    fun `should correctly calculate complexity per function with JSX conditionals`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_complexity_per_function"]).isEqualTo(2.0) //TODO: not counting ternary operator
        Assertions.assertThat(result.attributes["min_complexity_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_complexity_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should count JSX spread attributes and props`() {
        // Arrange
        val fileContent = $$"""
            interface ButtonProps {
                variant: 'primary' | 'secondary';
                onClick: () => void;
            }

            const Button = ({ variant, ...rest }: ButtonProps & React.HTMLProps<HTMLButtonElement>) => {
                return (
                    <button
                        className={`btn btn-${variant}`}
                        {...rest}
                    >
                        Click me
                    </button>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should handle JSX with template literals and expressions`() {
        // Arrange
        val fileContent = $$"""
            const StyledComponent = ({ color, size }: { color: string; size: number }) => {
                const style = {
                    color: color,
                    fontSize: `${size}px`
                };

                return (
                    <div style={style}>
                        {`This text is ${color} and ${size}px`}
                    </div>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should handle JSX with self-closing tags`() {
        // Arrange
        val fileContent = """
            const SelfClosingComponent = () => {
                return (
                    <div>
                        <img src="image.jpg" alt="description" />
                        <input type="text" placeholder="Enter text" />
                        <br />
                        <hr />
                    </div>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count nullish coalescing in JSX expressions for complexity`() {
        // Arrange
        val fileContent = """
            const Component = ({ value }: { value?: string }) => {
                return <div>{value ?? 'Default Value'}</div>;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function with JSX`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_rloc_per_function"]).isEqualTo(7.0)
        Assertions.assertThat(result.attributes["min_rloc_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["mean_rloc_per_function"]).isEqualTo(3.33)
        Assertions.assertThat(result.attributes["median_rloc_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should handle complex JSX with multiple conditional rendering patterns`() {
        // Arrange
        val fileContent = """
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
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(6.0)
    }
}
