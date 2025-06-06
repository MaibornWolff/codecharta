function sayHello(name: string = "World"): void {
    console.log(`Hello, ${name}!`);
}

// Call the function with default parameter
sayHello();

// Call the function with a custom name
sayHello("TypeScript");