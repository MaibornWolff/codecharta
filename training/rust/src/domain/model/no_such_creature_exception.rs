use std::error::Error;
use std::fmt;

use crate::domain::model::creature_id::CreatureId;

#[derive(Debug)]
pub struct NoSuchCreatureException {
    id: CreatureId,
}

impl NoSuchCreatureException {
    pub fn new(id: CreatureId) -> Self {
        NoSuchCreatureException { id }
    }
}

impl fmt::Display for NoSuchCreatureException {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "No such creature in the dungeon: {}", self.id.id)
    }
}

impl Error for NoSuchCreatureException {}
