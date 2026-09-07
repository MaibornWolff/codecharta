macro_rules! creature_count {
    ($($herd:expr),+ $(,)?) => {
        0usize $(+ $herd.len())+
    };
}

pub(crate) use creature_count;
