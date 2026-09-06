//! Module-level documentation comment for the sample crate.

// A normal line comment.
use std::collections::HashMap;

/// The maximum number of retries allowed.
const MAX_RETRIES: u32 = 3;

static GREETING: &str = "hello";

/// Represents a geometric shape.
pub struct Rectangle {
    width: f64,
    height: f64,
}

/// A color enumeration.
pub enum Color {
    Red,
    Green,
    Blue,
    Custom(u8, u8, u8),
}

/// A union of numeric representations.
pub union Number {
    integer: i64,
    floating: f64,
}

/// Behavior shared by drawable shapes.
pub trait Drawable {
    /// Returns the area of the shape.
    fn area(&self) -> f64;

    fn describe(&self) -> String;
}

type ShapeMap = HashMap<String, Rectangle>;

impl Rectangle {
    /// Creates a new rectangle.
    pub fn new(width: f64, height: f64) -> Rectangle {
        Rectangle { width, height }
    }
}

impl Drawable for Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn describe(&self) -> String {
        let label = "rectangle";
        let raw = r#"a "raw" string"#;
        let initial = 'R';
        format!("{} {} {}", label, raw, initial)
    }
}

/// Computes the sum of two integers.
fn add(a: i32, b: i32) -> i32 {
    let result = a + b;
    result
}

mod geometry {
    /* A block comment inside a module. */
    pub const PI: f64 = 3.14159;
}

macro_rules! square {
    ($x:expr) => {
        $x * $x
    };
}
