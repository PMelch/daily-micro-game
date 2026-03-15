/**
 * Bit Circuit - Game Logic
 * Logic gate circuit evaluation engine
 */

export const GATES = {
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  XOR: "XOR",
  NAND: "NAND",
  NOR: "NOR",
};

/**
 * Evaluate a single gate given its inputs.
 * @param {string} type - Gate type (GATES.*)
 * @param {boolean[]} inputs - Array of boolean input values
 * @returns {boolean}
 */
export function evaluateGate(type, inputs) {
  switch (type) {
    case GATES.AND:
      return inputs.every(Boolean);
    case GATES.OR:
      return inputs.some(Boolean);
    case GATES.NOT:
      return !inputs[0];
    case GATES.XOR:
      return inputs.reduce((a, b) => a !== b, false);
    case GATES.NAND:
      return !inputs.every(Boolean);
    case GATES.NOR:
      return !inputs.some(Boolean);
    default:
      throw new Error(`Unknown gate type: ${type}`);
  }
}

/**
 * Evaluate a full circuit given current switch states.
 * Circuit format:
 *   switches: boolean[]  — user-controlled input values
 *   gates: Array<{ type: GATES.*, inputs: Array<"sw<n>" | "g<n>"> }>
 *   output: number — index into gates[] for the final output
 *
 * @param {object} circuit
 * @returns {boolean} - output value
 */
export function evaluateCircuit(circuit) {
  const { switches, gates, output } = circuit;

  // Cache computed gate values to avoid re-computation
  const gateValues = new Array(gates.length);

  function resolveInput(ref) {
    if (typeof ref === "string") {
      if (ref.startsWith("sw")) {
        const idx = parseInt(ref.slice(2), 10);
        return Boolean(switches[idx]);
      }
      if (ref.startsWith("g")) {
        const idx = parseInt(ref.slice(1), 10);
        return computeGate(idx);
      }
    }
    // Numeric index = switch index (legacy simple circuits)
    return Boolean(switches[ref]);
  }

  function computeGate(idx) {
    if (gateValues[idx] !== undefined) return gateValues[idx];
    const gate = gates[idx];
    const inputVals = gate.inputs.map(resolveInput);
    gateValues[idx] = evaluateGate(gate.type, inputVals);
    return gateValues[idx];
  }

  return computeGate(output);
}

/**
 * Check if the circuit output matches the target value.
 */
export function isCircuitSolved(circuit, target) {
  return evaluateCircuit(circuit) === target;
}

/**
 * Level configurations.
 * Each level defines: title, description, circuit, target output.
 * Switches start at initial values; player can toggle them.
 */
export function getLevelConfig(levelNum) {
  const levels = [
    // Level 1: Single AND gate — simple intro
    {
      title: "AND Gate",
      descKey: "level1desc",
      circuit: {
        switches: [false, false],
        gates: [{ type: GATES.AND, inputs: ["sw0", "sw1"] }],
        output: 0,
      },
      target: true,
      switchLabels: ["A", "B"],
    },

    // Level 2: OR gate
    {
      title: "OR Gate",
      descKey: "level2desc",
      circuit: {
        switches: [false, false],
        gates: [{ type: GATES.OR, inputs: ["sw0", "sw1"] }],
        output: 0,
      },
      target: false,
      switchLabels: ["A", "B"],
    },

    // Level 3: NOT + AND (2 gates)
    {
      title: "NOT + AND",
      descKey: "level3desc",
      circuit: {
        switches: [true, false],
        gates: [
          { type: GATES.NOT, inputs: ["sw0"] },
          { type: GATES.AND, inputs: ["g0", "sw1"] },
        ],
        output: 1,
      },
      target: true,
      switchLabels: ["A", "B"],
    },

    // Level 4: XOR gate
    {
      title: "XOR Gate",
      descKey: "level4desc",
      circuit: {
        switches: [true, true],
        gates: [{ type: GATES.XOR, inputs: ["sw0", "sw1"] }],
        output: 0,
      },
      target: true,
      switchLabels: ["A", "B"],
    },

    // Level 5: 3 inputs, AND then OR
    {
      title: "3-Input Mix",
      descKey: "level5desc",
      circuit: {
        switches: [false, false, false],
        gates: [
          { type: GATES.AND, inputs: ["sw0", "sw1"] },
          { type: GATES.OR, inputs: ["g0", "sw2"] },
        ],
        output: 1,
      },
      target: true,
      switchLabels: ["A", "B", "C"],
    },

    // Level 6: NAND gate with NOT to get AND-like but inverted chain
    {
      title: "NAND & NOR",
      descKey: "level6desc",
      circuit: {
        switches: [true, true],
        gates: [
          { type: GATES.NAND, inputs: ["sw0", "sw1"] },
          { type: GATES.NOR, inputs: ["g0", "sw0"] },
        ],
        output: 1,
      },
      target: true,
      switchLabels: ["A", "B"],
    },

    // Level 7: Complex 3-switch, 3-gate chain
    {
      title: "Logic Chain",
      descKey: "level7desc",
      circuit: {
        switches: [false, false, false],
        gates: [
          { type: GATES.OR, inputs: ["sw0", "sw1"] },
          { type: GATES.NOT, inputs: ["g0"] },
          { type: GATES.AND, inputs: ["g1", "sw2"] },
        ],
        output: 2,
      },
      target: true,
      switchLabels: ["A", "B", "C"],
    },

    // Level 8: Complex 4-switch, 4-gate circuit
    {
      title: "Full Circuit",
      descKey: "level8desc",
      circuit: {
        switches: [false, false, false, false],
        gates: [
          { type: GATES.AND, inputs: ["sw0", "sw1"] },
          { type: GATES.XOR, inputs: ["sw2", "sw3"] },
          { type: GATES.OR, inputs: ["g0", "g1"] },
          { type: GATES.NAND, inputs: ["g2", "sw0"] },
        ],
        output: 3,
      },
      target: true,
      switchLabels: ["A", "B", "C", "D"],
    },
  ];

  return levels[levelNum - 1] || null;
}
