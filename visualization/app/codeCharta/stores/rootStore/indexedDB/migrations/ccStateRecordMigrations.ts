import { migrateCcStateRecordToV3 } from "./migrateToV3"
import { migrateCcStateRecordToV4 } from "./migrateToV4"
import { migrateCcStateRecordToV5 } from "./migrateToV5"
import { migrateCcStateRecordToV6 } from "./migrateToV6"
import { migrateCcStateRecordToV7 } from "./migrateToV7"
import { migrateCcStateRecordToV8 } from "./migrateToV8"
import { migrateCcStateRecordToV9 } from "./migrateToV9"
import { migrateCcStateRecordToV10 } from "./migrateToV10"
import { migrateCcStateRecordToV11 } from "./migrateToV11"
import { migrateCcStateRecordToV12 } from "./migrateToV12"
import { migrateCcStateRecordToV13 } from "./migrateToV13"
import { migrateCcStateRecordToV14 } from "./migrateToV14"
import { migrateCcStateRecordToV15 } from "./migrateToV15"
import { migrateCcStateRecordToV16 } from "./migrateToV16"
import { migrateCcStateRecordToV17 } from "./migrateToV17"
import { migrateCcStateRecordToV18 } from "./migrateToV18"
import { migrateCcStateRecordToV19 } from "./migrateToV19"
import { migrateCcStateRecordToV20 } from "./migrateToV20"
import { migrateCcStateRecordToV21 } from "./migrateToV21"
import { migrateCcStateRecordToV22 } from "./migrateToV22"
import { migrateCcStateRecordToV24 } from "./migrateToV24"
import { migrateCcStateRecordToV25 } from "./migrateToV25"
import { migrateCcStateRecordToV26 } from "./migrateToV26"
import { migrateCcStateRecordToV27 } from "./migrateToV27"
import { migrateCcStateRecordToV28 } from "./migrateToV28"
import { migrateCcStateRecordToV29 } from "./migrateToV29"
import { migrateCcStateRecordToV30 } from "./migrateToV30"
import { migrateCcStateRecordToV31 } from "./migrateToV31"
import { migrateCcStateRecordToV32 } from "./migrateToV32"
import { migrateCcStateRecordToV33 } from "./migrateToV33"
import { migrateCcStateRecordToV34 } from "./migrateToV34"
import { migrateCcStateRecordToV35 } from "./migrateToV35"

// The persisted CcState record is migrated forward one version at a time: each vN transform reshapes a
// (v(N-1))-shaped blob into vN. A blob written at oldVersion runs every transform whose target version is above it.
export const CCSTATE_RECORD_MIGRATIONS: ReadonlyArray<{ version: number; migrate: (state: unknown) => unknown }> = [
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
    { version: 25, migrate: migrateCcStateRecordToV25 },
    { version: 26, migrate: migrateCcStateRecordToV26 },
    { version: 27, migrate: migrateCcStateRecordToV27 },
    { version: 28, migrate: migrateCcStateRecordToV28 },
    { version: 29, migrate: migrateCcStateRecordToV29 },
    { version: 30, migrate: migrateCcStateRecordToV30 },
    { version: 31, migrate: migrateCcStateRecordToV31 },
    { version: 32, migrate: migrateCcStateRecordToV32 },
    { version: 33, migrate: migrateCcStateRecordToV33 },
    { version: 34, migrate: migrateCcStateRecordToV34 },
    { version: 35, migrate: migrateCcStateRecordToV35 }
]

export function migrateCcStateRecord(state: unknown, oldVersion: number): unknown {
    let migrated = state
    for (const { version, migrate } of CCSTATE_RECORD_MIGRATIONS) {
        if (oldVersion < version) {
            migrated = migrate(migrated)
        }
    }
    return migrated
}
