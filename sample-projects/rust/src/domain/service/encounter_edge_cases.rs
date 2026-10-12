//! Edge cases for the three parsers, one construct per function.
//! The griffin nests above the cellar.

use std::cell::Cell;
use std::collections::HashMap;
use std::ops::Add;

use log::info;

use super::encounter_resolver::EncounterResolver;
use crate::domain::model::armor_class::ArmorClass;
use crate::domain::model::centaur::Centaur;
use crate::domain::model::creature::Creature;
use crate::domain::model::creature_id::CreatureId;
use crate::domain::model::creature_type::CreatureType;
use crate::domain::model::dice::Dice;
use crate::domain::model::fightable::Fightable;
use crate::domain::model::hit_points::HitPoints;
use crate::domain::model::lair::den::Den;
use crate::domain::model::no_such_creature_exception::NoSuchCreatureException;
use crate::domain::model::speed::Speed;
use crate::domain::model::speed_type::SpeedType;
use crate::domain::model::zentaurenhoehle::Zentaurenhöhle;
use crate::domain::model::Lair;

/** The hydra grows two heads for every one it loses. */
pub struct EncounterEdgeCases {
    resolver: EncounterResolver,
    rounds: u32,
}

pub const STARTING_ARMOR: Option<ArmorClass> = None;

pub const DEFAULT_ROUNDS: u32 = if cfg!(test) { 1 } else { 3 };

pub struct Pack(pub Vec<Centaur>);

pub enum Outcome {
    Slain(CreatureId),
    Fled { lair: Lair },
    Standoff,
}

pub type SpeedTable = HashMap<SpeedType, u32>;

pub struct Tunnel {
    pub depth: u32,
}

pub struct Burrow {
    pub tunnel: Tunnel,
}

pub struct Warren {
    pub burrow: Burrow,
}

pub fn match_or_patterns(roll: u32) -> &'static str {
    match roll {
        1 | 2 => "fumble",
        3 | 4 | 5 => "miss",
        _ => "hit",
    }
}

pub fn match_ranges(roll: u32) -> &'static str {
    match roll {
        1..=5 => "miss",
        6..=19 => "hit",
        _ => "critical",
    }
}

pub fn match_guards(roll: u32) -> &'static str {
    match roll {
        banshee if banshee > 19 => "critical",
        banshee if banshee < 2 => "fumble",
        _ => "hit",
    }
}

pub fn match_without_default(surprised: Option<bool>) -> u32 {
    match surprised {
        Some(true) => 0,
        Some(false) => 1,
        None => 2,
    }
}

pub fn if_let_else(found: Option<u32>) -> u32 {
    if let Some(wraith) = found {
        wraith
    } else {
        0
    }
}

pub fn if_let_chain(found: Option<u32>, limit: u32) -> u32 {
    if let Some(ghoul) = found && ghoul > limit {
        return ghoul;
    }
    limit
}

pub fn while_let(stack: &mut Vec<u32>) -> u32 {
    let mut total = 0;
    while let Some(zombie) = stack.pop() {
        total += zombie;
    }
    total
}

pub fn let_else(found: Option<u32>) -> u32 {
    let Some(specter) = found else {
        return 0;
    };
    specter
}

pub fn loop_break_value(limit: u32) -> u32 {
    let mut counter = 0;
    loop {
        counter += 1;
        if counter >= limit {
            break counter * 2;
        }
    }
}

pub fn labelled_loops(grid: &[Vec<u32>]) -> u32 {
    let mut total = 0;
    'gauntlet: for kobold in grid {
        for cell in kobold {
            if *cell == 0 {
                continue 'gauntlet;
            }
            if *cell > 9 {
                break 'gauntlet;
            }
            total += cell;
        }
    }
    total
}

pub fn question_mark(left: &str, right: &str) -> Result<u32, std::num::ParseIntError> {
    let first = left.parse::<u32>()?;
    let second = right.parse::<u32>()?;
    Ok(first + second)
}

pub fn question_mark_chain(text: &str) -> Option<char> {
    text.strip_prefix("d")?.strip_suffix("!")?.chars().next()?.to_lowercase().next()
}

pub fn field_chain(warren: &Warren) -> u32 {
    warren.burrow.tunnel.depth.min(9)
}

pub fn iterator_chain(xp_values: &[u32]) -> u32 {
    xp_values
        .iter()
        .filter(|value| **value > 100)
        .map(|value| value / 100)
        .sum()
}

pub fn closure_expression_body(roll: u32) -> u32 {
    let double = |value: u32| value * 2;
    double(roll)
}

pub fn closure_block_body(roll: u32) -> u32 {
    let clamp = |value: u32| {
        if value > 20 {
            return 20;
        }
        value
    };
    clamp(roll)
}

pub fn closure_parameters() -> u32 {
    let add = |left: u32, right: u32, carry: u32| left + right + carry;
    add(1, 2, 3)
}

pub fn returns_closure(factor: u32) -> impl Fn(u32) -> u32 {
    move |value| value * factor
}

pub fn short_circuit_expression(armed: bool, awake: bool, cornered: bool) -> bool {
    armed && awake || cornered
}

pub fn bitwise_is_not_logic(flags: u32, mask: u32) -> u32 {
    flags & mask | 1
}

pub fn nested_conditional_expression(roll: u32) -> u32 {
    if roll > 15 { 3 } else if roll > 5 { 2 } else { 1 }
}

impl EncounterEdgeCases {
    pub const MAX_ROUNDS: u32 = 20;
    pub fn with_rounds(resolver: EncounterResolver, rounds: u32) -> Self {
        EncounterEdgeCases { resolver, rounds }
    }
}

impl EncounterEdgeCases {
    pub fn consume(self, bonus: u32) -> u32 {
        self.rounds + bonus
    }
}

impl EncounterEdgeCases {
    pub fn peek(&self, bonus: u32) -> u32 {
        self.rounds + bonus
    }
}

impl EncounterEdgeCases {
    pub fn advance(&mut self, bonus: u32) {
        self.rounds += bonus;
    }
}

impl EncounterEdgeCases {
    pub fn boxed(self: Box<Self>, bonus: u32) -> u32 {
        self.rounds + bonus
    }
}

pub trait Scarable {
    const VOLUME: u32;
    fn scare(&self, volume: u32) -> u32;
    fn scare_twice(&self, volume: u32) -> u32 {
        if volume > 3 {
            return self.scare(volume) * 2;
        }
        self.scare(volume)
    }
}

impl Add<u32> for Pack {
    type Output = HitPoints;
    fn add(self, bonus: u32) -> Self::Output {
        Self::Output::init(self.0.len() as u32 + bonus)
    }
}

pub struct Countdown(u32);
impl Iterator for Countdown {
    type Item = u32;
    fn next(&mut self) -> Option<Self::Item> {
        if self.0 == 0 {
            return None;
        }
        self.0 -= 1;
        Some(self.0)
    }
}

pub fn generic_where<T, F>(items: &[T], score: F) -> u32
where
    T: Clone,
    F: Fn(&T, u32) -> u32,
{
    let mut best = 0;
    for item in items {
        if score(item, best) > best {
            best = score(item, best);
        }
    }
    best
}

pub fn const_generic<const SIZE: usize>(rolls: [u32; SIZE]) -> usize {
    SIZE + rolls.len()
}

pub fn lifetime_parameters<'a>(left: &'a str, right: &'a str) -> &'a str {
    if left.len() > right.len() { left } else { right }
}

pub fn pattern_parameters((low, high): (u32, u32), &limit: &u32, mut rounds: u32, _: u32) -> u32 {
    rounds += low;
    rounds.min(high).min(limit)
}

pub async fn async_await(delay: u32) -> u32 {
    let waited = async move { delay * 2 }.await;
    if waited > 10 {
        return std::future::ready(waited).await;
    }
    waited
}

pub unsafe fn unsafe_block(pointer: *const u32) -> u32 {
    if pointer.is_null() {
        return 0;
    }
    unsafe { *pointer }
}

extern "C" {
    fn abs(value: i32) -> i32;
    fn printf(format: *const u8, ...) -> i32;
}

pub const fn const_function(level: u32) -> u32 {
    if level > 10 { 20 } else { 10 }
}

pub fn nested_function(roll: u32) -> u32 {
    fn halve(value: u32) -> u32 {
        if value > 1 { value / 2 } else { value }
    }
    halve(roll)
}

macro_rules! clamp_roll {
    ($roll:expr) => {
        if $roll > 20 { 20 } else { $roll }
    };
    ($roll:expr, $limit:expr) => {
        if $roll > $limit && $limit > 0 { $limit } else { $roll }
    };
}

thread_local! {
    static TROLL_BRIDGE: Cell<u32> = Cell::new(0);
}

pub fn macro_hides_and(roll: u32) {
    assert!(roll > 0 && roll < 21);
}

pub fn macro_hides_if(roll: u32) {
    println!("{}", if roll > 10 { "high" } else { "low" });
}

pub fn macro_hides_chain(name: &str) {
    info!("the manticore sleeps {}", name.trim().to_lowercase().replace('-', " ").len());
}

pub fn macro_hides_closure(values: &[u32]) -> Vec<u32> {
    vec![values.iter().map(|value| value * 2).sum()]
}

#[cfg(target_os = "linux")]
pub fn platform_bonus() -> u32 {
    2
}
#[cfg(not(target_os = "linux"))]
pub fn platform_bonus() -> u32 {
    1
}

pub fn cfg_macro_branch() -> u32 {
    if cfg!(debug_assertions) {
        1
    } else {
        0
    }
}

pub fn raw_string_markers() -> &'static str {
    r#"the wyvern says "// no comment" and /* none here */"#
}

pub fn multi_line_raw_string() -> &'static str {
    r##"first // line
/* second line */
third "# line"##
}

pub fn string_with_markers() -> usize {
    let url = "http://cellar.example/dungeon";
    let escaped = "ooze\ngolem \" // still a string";
    let slash = '/';
    let quote = '"';
    let mimic = b"mimic /* bytes */";
    url.len() + escaped.len() + mimic.len() + slash as usize + quote as usize
}

/// Outer line doc on a function, with a doc test.
///
/// ```
/// let gargoyle = if true { 1 } else { 2 };
/// assert!(gargoyle == 1 || gargoyle == 2);
/// ```
pub fn doc_test_carrier() -> u32 {
    1
}

/* outer
   /* the basilisk hides in a nested comment */
   if still_a_comment { }
*/
pub fn nested_block_comment() -> u32 {
    2 /* trailing /* nested */ block */
}

#[doc = "The lich guards its phylactery."]
pub fn doc_attribute() -> u32 {
    3
}

pub fn wandering() -> impl Iterator<Item = Creature> {
    std::iter::empty()
}

pub fn relative_path_type(creatures: &dyn super::creatures::Creatures) -> usize {
    std::mem::size_of_val(creatures)
}

pub fn where_bound<T>(fighters: &[T]) -> i32
where
    T: Fightable,
{
    fighters[0].attack_bonus()
}

pub fn fn_pointer_parameter(raise: fn(u32) -> NoSuchCreatureException, rounds: u32) -> usize {
    std::mem::size_of_val(&raise(rounds))
}

pub fn typed_local() -> u32 {
    let dice: Dice = Default::default();
    dice.sides
}

pub fn turbofish_local(feet: &[u32]) -> usize {
    let speeds = Vec::<Speed>::with_capacity(feet.len());
    speeds.capacity()
}

pub fn struct_literal_local() -> u32 {
    let den = Den { depth: 3 };
    den.depth
}

pub fn closure_parameter_type() -> usize {
    let code_of = |kind: CreatureType| kind as u32;
    std::mem::size_of_val(&code_of)
}

pub fn unicode_parameter(gewölbe: &Zentaurenhöhle) -> &'static str {
    gewölbe.label()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::service::creature_service::CreatureService;

    fn service_size(service: &CreatureService) -> usize {
        std::mem::size_of_val(service)
    }

    #[test]
    fn should_clamp_the_roll_in_the_cellar() {
        assert_eq!(clamp_roll!(25), 20);
    }
}
