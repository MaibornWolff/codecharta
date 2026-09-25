#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CreatureId {
    pub id: String,
}

impl CreatureId {
    pub fn new(id: impl Into<String>) -> Self {
        CreatureId { id: id.into() }
    }
}
