export function createEncounterTracker() {
  let activePair = null;

  return {
    update(result, limit) {
      if (!Number.isFinite(limit) || limit < 0) {
        throw new RangeError("O limite de encontro deve ser não negativo.");
      }

      const nextPair = result?.pair &&
          Number.isFinite(result.distance) &&
          result.distance <= limit
        ? normalizePair(result.pair)
        : null;

      if (samePair(activePair, nextPair)) {
        return [];
      }

      const events = [];

      if (activePair) {
        events.push({
          type: "encounter-end",
          pair: [...activePair]
        });
      }

      if (nextPair) {
        events.push({
          type: "encounter-start",
          pair: [...nextPair]
        });
      }

      activePair = nextPair;
      return events;
    },

    reset() {
      activePair = null;
    },

    get activePair() {
      return activePair === null ? null : [...activePair];
    }
  };
}

function normalizePair(pair) {
  if (
    !Array.isArray(pair) ||
    pair.length !== 2 ||
    typeof pair[0] !== "string" ||
    typeof pair[1] !== "string"
  ) {
    throw new TypeError("O par deve conter dois IDs de personagens.");
  }

  return pair[0] < pair[1]
    ? [pair[0], pair[1]]
    : [pair[1], pair[0]];
}

function samePair(first, second) {
  return first === null
    ? second === null
    : second !== null &&
      first[0] === second[0] &&
      first[1] === second[1];
}
