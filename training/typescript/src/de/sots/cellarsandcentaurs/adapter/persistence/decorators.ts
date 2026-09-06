type TableConstructor = new () => object;

export function Persistent(table: TableConstructor): ClassDecorator {
    return (target) => {
        Object.defineProperty(target, "table", { value: table.name });
    };
}
