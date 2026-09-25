#[derive(Debug, Clone)]
pub struct CreatureEntity {
    pub id: String,
}

impl CreatureEntity {
    pub fn new(id: Option<String>) -> Self {
        CreatureEntity {
            id: id.unwrap_or_else(|| "ididid".to_string()),
        }
    }
}
