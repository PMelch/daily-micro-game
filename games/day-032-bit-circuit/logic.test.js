// TDD Tests for Bit Circuit game logic
// Run with: bun test logic.test.js

import { describe, test, expect } from "bun:test";
import {
  evaluateGate,
  evaluateCircuit,
  isCircuitSolved,
  getLevelConfig,
  GATES,
} from "./logic.js";

describe("Gate evaluation", () => {
  test("AND gate: both true = true", () => {
    expect(evaluateGate(GATES.AND, [true, true])).toBe(true);
  });
  test("AND gate: one false = false", () => {
    expect(evaluateGate(GATES.AND, [true, false])).toBe(false);
    expect(evaluateGate(GATES.AND, [false, true])).toBe(false);
  });
  test("AND gate: both false = false", () => {
    expect(evaluateGate(GATES.AND, [false, false])).toBe(false);
  });

  test("OR gate: both true = true", () => {
    expect(evaluateGate(GATES.OR, [true, true])).toBe(true);
  });
  test("OR gate: one true = true", () => {
    expect(evaluateGate(GATES.OR, [true, false])).toBe(true);
  });
  test("OR gate: both false = false", () => {
    expect(evaluateGate(GATES.OR, [false, false])).toBe(false);
  });

  test("XOR gate: different = true", () => {
    expect(evaluateGate(GATES.XOR, [true, false])).toBe(true);
    expect(evaluateGate(GATES.XOR, [false, true])).toBe(true);
  });
  test("XOR gate: same = false", () => {
    expect(evaluateGate(GATES.XOR, [true, true])).toBe(false);
    expect(evaluateGate(GATES.XOR, [false, false])).toBe(false);
  });

  test("NOT gate: true = false", () => {
    expect(evaluateGate(GATES.NOT, [true])).toBe(false);
  });
  test("NOT gate: false = true", () => {
    expect(evaluateGate(GATES.NOT, [false])).toBe(true);
  });

  test("NAND gate: both true = false", () => {
    expect(evaluateGate(GATES.NAND, [true, true])).toBe(false);
  });
  test("NAND gate: one false = true", () => {
    expect(evaluateGate(GATES.NAND, [true, false])).toBe(true);
  });

  test("NOR gate: both false = true", () => {
    expect(evaluateGate(GATES.NOR, [false, false])).toBe(true);
  });
  test("NOR gate: one true = false", () => {
    expect(evaluateGate(GATES.NOR, [true, false])).toBe(false);
  });
});

describe("Circuit evaluation", () => {
  test("Simple AND circuit: [1,1] -> AND -> true", () => {
    const circuit = {
      switches: [true, true],
      gates: [{ type: GATES.AND, inputs: [0, 1] }], // input indices
      output: 0, // gate index
    };
    const result = evaluateCircuit(circuit);
    expect(result).toBe(true);
  });

  test("Simple NOT circuit: [1] -> NOT -> false", () => {
    const circuit = {
      switches: [true],
      gates: [{ type: GATES.NOT, inputs: [0] }],
      output: 0,
    };
    const result = evaluateCircuit(circuit);
    expect(result).toBe(false);
  });

  test("Chained circuit: A AND B -> NOT -> output", () => {
    // switches: [true, true]
    // gate 0: AND([sw0, sw1]) = true
    // gate 1: NOT([gate0]) = false
    const circuit = {
      switches: [true, true],
      gates: [
        { type: GATES.AND, inputs: ["sw0", "sw1"] },
        { type: GATES.NOT, inputs: ["g0"] },
      ],
      output: 1,
    };
    const result = evaluateCircuit(circuit);
    expect(result).toBe(false);
  });

  test("Chained circuit: A OR B -> NOT, then AND with C", () => {
    // switches: [false, false, true]
    // gate 0: OR([sw0, sw1]) = false
    // gate 1: NOT([g0]) = true
    // gate 2: AND([g1, sw2]) = true
    const circuit = {
      switches: [false, false, true],
      gates: [
        { type: GATES.OR, inputs: ["sw0", "sw1"] },
        { type: GATES.NOT, inputs: ["g0"] },
        { type: GATES.AND, inputs: ["g1", "sw2"] },
      ],
      output: 2,
    };
    expect(evaluateCircuit(circuit)).toBe(true);
  });
});

describe("isCircuitSolved", () => {
  test("Returns true when output matches target", () => {
    const circuit = {
      switches: [true, false],
      gates: [{ type: GATES.OR, inputs: ["sw0", "sw1"] }],
      output: 0,
    };
    expect(isCircuitSolved(circuit, true)).toBe(true);
  });

  test("Returns false when output does not match target", () => {
    const circuit = {
      switches: [false, false],
      gates: [{ type: GATES.AND, inputs: ["sw0", "sw1"] }],
      output: 0,
    };
    expect(isCircuitSolved(circuit, true)).toBe(false);
  });
});

describe("getLevelConfig", () => {
  test("Level 1 exists and has required fields", () => {
    const level = getLevelConfig(1);
    expect(level).toBeTruthy();
    expect(typeof level.title).toBe("string");
    expect(Array.isArray(level.circuit.switches)).toBe(true);
    expect(Array.isArray(level.circuit.gates)).toBe(true);
    expect(typeof level.circuit.output).toBe("number");
    expect(typeof level.target).toBe("boolean");
  });

  test("All 8 levels exist and are valid", () => {
    for (let i = 1; i <= 8; i++) {
      const level = getLevelConfig(i);
      expect(level).toBeTruthy();
      expect(level.circuit.switches.length).toBeGreaterThanOrEqual(1);
      expect(level.circuit.gates.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("Level 8 is more complex than level 1", () => {
    const l1 = getLevelConfig(1);
    const l8 = getLevelConfig(8);
    const complexity1 = l1.circuit.gates.length + l1.circuit.switches.length;
    const complexity8 = l8.circuit.gates.length + l8.circuit.switches.length;
    expect(complexity8).toBeGreaterThan(complexity1);
  });
});

describe("Gate types constants", () => {
  test("All required gate types exist", () => {
    expect(GATES.AND).toBeDefined();
    expect(GATES.OR).toBeDefined();
    expect(GATES.NOT).toBeDefined();
    expect(GATES.XOR).toBeDefined();
    expect(GATES.NAND).toBeDefined();
    expect(GATES.NOR).toBeDefined();
  });
});
