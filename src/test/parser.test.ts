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

  describe("Reverse attribute flags", () => {
    it("should parse reverse attribute flag (brief syntax R)", () => {
      const result = parseEcl("<< 404684003: R 363698007 = << 39057004");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.type).toBe("Attribute");
      expect(attribute.reverseFlag).toBe(true);
    });

    it("should parse reverse attribute flag (brief syntax lowercase r)", () => {
      const result = parseEcl("<< 404684003: r 363698007 = << 39057004");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.reverseFlag).toBe(true);
    });

    it("should parse reverse attribute flag (long syntax reverseOf)", () => {
      const result = parseEcl("<< 404684003: reverseOf 363698007 = << 39057004");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.type).toBe("Attribute");
      expect(attribute.reverseFlag).toBe(true);
    });

    it("should parse reverse flag with cardinality", () => {
      const result = parseEcl("<< 404684003: [1..*] R 363698007 = << 39057004");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.reverseFlag).toBe(true);
      expect(attribute.cardinality).toBeDefined();
    });

    it("should not set reverseFlag for normal attributes", () => {
      const result = parseEcl("<< 404684003: 363698007 = << 39057004");
      expect(result.errors).toHaveLength(0);
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.reverseFlag).toBeUndefined();
    });
  });

  describe("Dotted attributes", () => {
    it("should parse simple dotted attribute notation", () => {
      const result = parseEcl("< 125605004 . 363698007");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("SubExpression");
      const subExpr = result.ast as any;
      expect(subExpr.focusConcept.type).toBe("DottedAttributePath");
      expect(subExpr.focusConcept.base).toBeDefined();
      expect(subExpr.focusConcept.attributes).toHaveLength(1);
    });

    it("should parse chained dotted attributes", () => {
      const result = parseEcl("<< 19829001 . < 47429007 . 363698007");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("SubExpression");
      const subExpr = result.ast as any;
      expect(subExpr.focusConcept.type).toBe("DottedAttributePath");
      expect(subExpr.focusConcept.base).toBeDefined();
      expect(subExpr.focusConcept.attributes).toHaveLength(2);
    });

    it("should parse dotted notation with constraint operators", () => {
      const result = parseEcl("< 125605004 . << 363698007");
      expect(result.errors).toHaveLength(0);
      const subExpr = result.ast as any;
      expect(subExpr.focusConcept.type).toBe("DottedAttributePath");
      const base = subExpr.focusConcept.base;
      expect(base.constraintOperator.operator).toBe("<");
      const attr = subExpr.focusConcept.attributes[0];
      expect(attr.constraintOperator.operator).toBe("<<");
    });

    it("should parse nested parentheses with dots", () => {
      const result = parseEcl("((< 19829001) . < 47429007) . 363698007");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("SubExpression");
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
            constraints: [{ type: "TermFilter", values: ["heart"] }],
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
