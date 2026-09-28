pub struct CreatureNaming {
    prefix: String,
}

impl CreatureNaming {
    pub fn new(prefix: impl Into<String>) -> Self {
        CreatureNaming { prefix: prefix.into() }
    }

    pub fn name_for(&self, index: usize) -> String {
        format!("{}-{}", self.prefix, index)
    }
}
