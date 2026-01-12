import { describe, it, expect } from "vitest";
import { parseEcl } from "../parser";

describe("ECL Parser", () => {
  describe("Simple concept references", () => {
    it("should parse concept ID only", () => {
      const result = parseEcl("404684003");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        focusConcept: {
          type: "ConceptReference",
          sctId: "404684003",
        },
      });
    });

    it("should parse concept ID with term", () => {
      const result = parseEcl("404684003 |Clinical finding|");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        focusConcept: {
          type: "ConceptReference",
          sctId: "404684003",
          term: "Clinical finding",
        },
      });
    });
  });

  describe("Constraint operators", () => {
    it("should parse descendantOf (<)", () => {
      const result = parseEcl("< 404684003");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        constraintOperator: { operator: "<" },
      });
    });

    it("should parse descendantOrSelfOf (<<)", () => {
      const result = parseEcl("<< 404684003 |Clinical finding|");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        constraintOperator: { operator: "<<" },
      });
    });

    it("should parse memberOf (^)", () => {
      const result = parseEcl("^ 700043003");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        constraintOperator: { operator: "^" },
      });
    });

    it("should parse wildcard (*)", () => {
      const result = parseEcl("*");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        focusConcept: { type: "WildcardConcept" },
      });
    });
  });

  describe("Compound expressions", () => {
    it("should parse AND expression", () => {
      const result = parseEcl("<< 19829001 AND << 301867009");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "CompoundExpression",
        operator: "AND",
      });
    });

    it("should parse OR expression", () => {
      const result = parseEcl("<< 19829001 OR << 301867009");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "CompoundExpression",
        operator: "OR",
      });
    });

    it("should parse MINUS expression", () => {
      const result = parseEcl("<< 19829001 MINUS << 301867009");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "CompoundExpression",
        operator: "MINUS",
      });
    });
  });

  describe("Refinements", () => {
    it("should parse simple refinement", () => {
      const result = parseEcl("<< 404684003: 363698007 = << 39057004");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "RefinedExpression",
        refinement: {
          type: "Refinement",
          items: [{ type: "Attribute" }],
        },
      });
    });

    it("should parse attribute group", () => {
      const result = parseEcl("<< 404684003: { 363698007 = << 39057004 }");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "RefinedExpression",
        refinement: {
          type: "Refinement",
          items: [{ type: "AttributeGroup" }],
        },
      });
    });

    it("should parse multiple attributes", () => {
      const result = parseEcl("<< 404684003: 363698007 = << 39057004, 116676008 = << 55641003");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      expect(refined.refinement.items).toHaveLength(2);
    });
  });

  describe("Nested expressions", () => {
    it("should parse parenthesized expression", () => {
      const result = parseEcl("(<< 404684003)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        focusConcept: {
          type: "NestedExpression",
        },
      });
    });

    it("should parse complex nested expression", () => {
      const result = parseEcl("(<< 404684003: 363698007 = << 39057004) AND (<< 64572001)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("CompoundExpression");
    });
  });

  describe("Filters", () => {
    it("should parse term filter", () => {
      const result = parseEcl('<< 404684003 {{ term = "heart" }}');
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        filters: [
          {
            type: "Filter",
            constraints: [{ type: "TermFilter", value: "heart" }],
          },
        ],
      });
    });

    it("should parse dialect filter", () => {
      const result = parseEcl("<< 404684003 {{ dialect = en-US }}");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        filters: [
          {
            type: "Filter",
            constraints: [{ type: "DialectFilter", value: "en-US" }],
          },
        ],
      });
    });
  });

  describe("Error handling", () => {
    it("should report errors for invalid input", () => {
      const result = parseEcl("<<< invalid");
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
