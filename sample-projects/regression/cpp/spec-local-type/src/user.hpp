#include "node.hpp"

struct User {
    int count() {
        struct Node { int local; };
        Node node{1};
        return node.local;
    }
};
