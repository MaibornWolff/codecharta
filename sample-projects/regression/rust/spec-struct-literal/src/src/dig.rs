use crate::den::Den;

pub fn dig() -> u8 {
    let Den { depth } = Den { depth: 3 };
    depth
}
