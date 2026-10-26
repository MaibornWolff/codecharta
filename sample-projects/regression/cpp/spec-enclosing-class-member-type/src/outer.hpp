#include "a.hpp"

struct Outer {
    struct A { int own; };
    struct B { A a; };
};
