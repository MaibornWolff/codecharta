import HitPointsModule = require('./HitPoints')

// A CommonJS TypeScript file with an import-equals require.
function stableSize(centaurCount: number): number {
  if (centaurCount > HitPointsModule.HitPoints.MAX_HIT_POINTS) {
    return 0
  }
  return centaurCount * 2
}

export = stableSize
