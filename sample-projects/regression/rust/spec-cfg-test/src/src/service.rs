pub struct Service;

#[cfg(test)]
mod tests {
    use crate::model::Creature;

    pub struct Fake {
        pub boss: Creature,
    }
}
