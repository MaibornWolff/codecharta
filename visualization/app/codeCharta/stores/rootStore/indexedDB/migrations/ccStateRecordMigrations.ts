import {
    migrateCcStateRecordToV10,
    migrateCcStateRecordToV11,
    migrateCcStateRecordToV12,
    migrateCcStateRecordToV14,
    migrateCcStateRecordToV15
} from "./dissolveGrabBagsMigrations"
import {
    migrateCcStateRecordToV3,
    migrateCcStateRecordToV4,
    migrateCcStateRecordToV5,
    migrateCcStateRecordToV6,
    migrateCcStateRecordToV7,
    migrateCcStateRecordToV8,
    migrateCcStateRecordToV9
} from "./rehomeKeysMigrations"
import {
    migrateCcStateRecordToV17,
    migrateCcStateRecordToV18,
    migrateCcStateRecordToV19,
    migrateCcStateRecordToV20,
    migrateCcStateRecordToV21,
    migrateCcStateRecordToV24,
    migrateCcStateRecordToV25
} from "./seedDefaultsMigrations"
import { migrateCcStateRecordToV22 } from "./splitBlacklistMigration"
import { migrateCcStateRecordToV13, migrateCcStateRecordToV16 } from "./splitLensSourcesMigrations"

/** Each vN transform reshapes a v(N-1)-shaped record into vN; a record written at an older version runs every later one in order. */
const CCSTATE_RECORD_MIGRATIONS: ReadonlyArray<{ version: number; migrate: (state: unknown) => unknown }> = [
    { version: 3, migrate: migrateCcStateRecordToV3 },
    { version: 4, migrate: migrateCcStateRecordToV4 },
    { version: 5, migrate: migrateCcStateRecordToV5 },
    { version: 6, migrate: migrateCcStateRecordToV6 },
    { version: 7, migrate: migrateCcStateRecordToV7 },
    { version: 8, migrate: migrateCcStateRecordToV8 },
    { version: 9, migrate: migrateCcStateRecordToV9 },
    { version: 10, migrate: migrateCcStateRecordToV10 },
    { version: 11, migrate: migrateCcStateRecordToV11 },
    { version: 12, migrate: migrateCcStateRecordToV12 },
    { version: 13, migrate: migrateCcStateRecordToV13 },
    { version: 14, migrate: migrateCcStateRecordToV14 },
    { version: 15, migrate: migrateCcStateRecordToV15 },
    { version: 16, migrate: migrateCcStateRecordToV16 },
    { version: 17, migrate: migrateCcStateRecordToV17 },
    { version: 18, migrate: migrateCcStateRecordToV18 },
    { version: 19, migrate: migrateCcStateRecordToV19 },
    { version: 20, migrate: migrateCcStateRecordToV20 },
    { version: 21, migrate: migrateCcStateRecordToV21 },
    { version: 22, migrate: migrateCcStateRecordToV22 },
    { version: 24, migrate: migrateCcStateRecordToV24 },
    { version: 25, migrate: migrateCcStateRecordToV25 }
]

export function needsCcStateRecordMigration(oldVersion: number): boolean {
    return CCSTATE_RECORD_MIGRATIONS.some(({ version }) => oldVersion < version)
}

export function migrateCcStateRecord(state: unknown, oldVersion: number): unknown {
    let migrated = state
    for (const { version, migrate } of CCSTATE_RECORD_MIGRATIONS) {
        if (oldVersion < version) {
            migrated = migrate(migrated)
        }
    }
    return migrated
}
