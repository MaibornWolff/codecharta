pub mod creature_facade;
pub mod creature_report;
pub mod creature_util;
pub mod dto;
#[path = "creature_naming.rs"]
pub mod naming;

pub use creature_facade::CreatureFacade;
pub use creature_util::CreatureUtil;
