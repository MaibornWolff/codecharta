/**
 * A comprehensive sample file demonstrating various C features.
 * Used for golden file contract testing.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Constants */
#define MAX_RETRIES 3
#define BUFFER_SIZE 256

/* Status enum */
typedef enum {
    STATUS_PENDING,
    STATUS_ACTIVE,
    STATUS_COMPLETED
} Status;

/* Sample struct */
typedef struct {
    char prefix[64];
    int counter;
} Sample;

/* Simple getter with no complexity */
int get_counter(const Sample* sample) {
    return sample->counter;
}

/* Calculate sum with validation and control flow */
int calculate(int a, int b, int c, int d, int e) {
    if (a < 0 || b < 0) {
        return 0;
    }
    int sum = 0;
    for (int i = 0; i < c; i++) {
        sum += a + b;
    }
    while (d > 0) {
        sum += d;
        d--;
    }
    return sum + e;
}

/*
 * A long function that processes data with nested logic.
 * This tests long_method detection (15+ lines).
 */
char* process_data(const char** items, int item_count) {
    static char result[BUFFER_SIZE];
    result[0] = '\0';
    int count = 0;

    for (int i = 0; i < item_count; i++) {
        const char* item = items[i];
        if (item == NULL) {
            continue;
        }
        int len = strlen(item);
        if (len == 0) {
            strcat(result, "empty");
        } else if (len > 10) {
            for (int j = 0; j < 3; j++) {
                strncat(result, item, 5);
            }
        } else {
            strcat(result, item);
        }
        count++;
    }
    char count_str[32];
    sprintf(count_str, " total: %d", count);
    strcat(result, count_str);
    return result;
}

/* Demonstrates switch statement usage */
const char* format_by_type(int type) {
    const char* label;
    switch (type) {
        case 1:
            label = "one";
            break;
        case 2:
            label = "two";
            break;
        case 3:
            label = "three";
            break;
        default:
            label = "unknown";
    }
    return label;
}

/* Initialize sample struct */
void init_sample(Sample* sample, const char* prefix) {
    strncpy(sample->prefix, prefix, sizeof(sample->prefix) - 1);
    sample->prefix[sizeof(sample->prefix) - 1] = '\0';
    sample->counter = 0;
}

/* Pointer manipulation example */
int* create_array(int size) {
    int* arr = (int*)malloc(size * sizeof(int));
    if (arr == NULL) {
        return NULL;
    }
    for (int i = 0; i < size; i++) {
        arr[i] = i * 2;
    }
    return arr;
}

/* Free function */
void free_array(int* arr) {
    free(arr);
}
