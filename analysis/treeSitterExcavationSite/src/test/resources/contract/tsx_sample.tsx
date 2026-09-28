/**
 * A sample TSX file demonstrating React component patterns.
 * Used for golden file contract testing.
 */

// Interface for component props
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

// Type alias for status
type Status = "idle" | "loading" | "error";

// Simple functional component with props
const Button = ({ label, onClick, disabled }: ButtonProps) => {
    if (disabled) {
        return <button disabled>{label}</button>;
    }
    return (
        <button onClick={onClick} className="btn">
            {label}
        </button>
    );
};

// Component with conditional rendering and state-like logic
const StatusBadge = ({ status }: { status: Status }) => {
    let text = "Unknown";
    if (status === "idle") {
        text = "Ready";
    } else if (status === "loading") {
        text = "Loading...";
    } else if (status === "error") {
        text = "Error";
    }
    return (
        <span className={"badge badge-" + status}>{text}</span>
    );
};

/* Card component combining multiple elements */
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="card-body">{children}</div>
        </div>
    );
};

// Arrow function with chained calls
const formatLabel = (value: string | null): string | undefined => {
    return value?.trim().toLowerCase();
};

// Component using custom JSX elements (covers jsx_opening_element, jsx_self_closing_element, jsx_attribute)
const App = ({ onClose }: { onClose: () => void }) => {
    return (
        <Card title="Welcome">
            <Icon />
            <Button label="Close" onClick={onClose} />
        </Card>
    );
};

export { Button, StatusBadge, Card, formatLabel, App };
export type { ButtonProps, Status };
