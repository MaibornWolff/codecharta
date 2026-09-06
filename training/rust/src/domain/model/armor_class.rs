use crate::application::CreatureUtil;

#[derive(Debug, Clone)]
pub struct ArmorClass {
    description: String,
    base: u32,
    bonus: u32,
    total: u32,
}

impl ArmorClass {
    pub fn new(base: u32, bonus: u32) -> Self {
        Self::with_description(base, bonus, CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION)
    }

    pub fn with_description(base: u32, bonus: u32, description: &str) -> Self {
        ArmorClass {
            description: description.to_string(),
            base,
            bonus,
            total: base + bonus,
        }
    }

    pub fn description(&self) -> &str {
        &self.description
    }

    pub fn base(&self) -> u32 {
        self.base
    }

    pub fn bonus(&self) -> u32 {
        self.bonus
    }

    pub fn total(&self) -> u32 {
        self.total
    }
}
