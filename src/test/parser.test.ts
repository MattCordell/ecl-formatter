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

    it("should parse nested constraint operators with parentheses", () => {
      const result = parseEcl("<< (^ 929360071000036103)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        constraintOperator: { operator: "<<" },
      });
    });

    it("should parse memberOf after constraint operator with space", () => {
      const result = parseEcl("<< ^ 929360071000036103");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        constraintOperator: { operator: "<<" },
        memberOf: true,
      });
    });

    it("should parse memberOf after constraint operator without space", () => {
      const result = parseEcl("<<^929360071000036103");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "SubExpression",
        constraintOperator: { operator: "<<" },
        memberOf: true,
      });
    });

    it("should parse complex nested expression from user issue (no parentheses)", () => {
      // Now works: <<^929360071000036103 (memberOf after constraint operator)
      const result = parseEcl("^ 929360061000036106 OR <<^929360071000036103");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "CompoundExpression",
        operator: "OR",
      });
      // Verify the right side has both constraintOperator and memberOf
      const ast = result.ast as any;
      expect(ast.right.constraintOperator.operator).toBe("<<");
      expect(ast.right.memberOf).toBe(true);
    });

    it("should parse complex nested expression from user issue (with parentheses)", () => {
      // Also works: << (^ 929360071000036103) (parenthesized)
      const result = parseEcl("^ 929360061000036106 OR << (^ 929360071000036103)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toMatchObject({
        type: "CompoundExpression",
        operator: "OR",
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

  describe("Parenthesized attribute sets", () => {
    it("should parse single attribute in parentheses", () => {
      const result = parseEcl("<< 404684003: (363698007 = << 39057004)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      expect(refined.refinement.items).toHaveLength(1);
      expect(refined.refinement.items[0].type).toBe("NestedAttributeSet");
      expect(refined.refinement.items[0].items).toHaveLength(1);
      expect(refined.refinement.items[0].items[0].type).toBe("Attribute");
    });

    it("should parse parenthesized attribute set with OR", () => {
      const result = parseEcl("<< 404684003: (363698007 = << 39057004 OR 116676008 = << 55641003)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      expect(refined.refinement.items).toHaveLength(1);
      const nestedSet = refined.refinement.items[0];
      expect(nestedSet.type).toBe("NestedAttributeSet");
      expect(nestedSet.items).toHaveLength(2);
      expect(nestedSet.conjunctions).toEqual(["OR"]);
    });

    it("should parse parenthesized attribute set with comma", () => {
      const result = parseEcl(">> 715010008: (263583002 = 711387003, * = 723612001)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const nestedSet = refined.refinement.items[0];
      expect(nestedSet.type).toBe("NestedAttributeSet");
      expect(nestedSet.items).toHaveLength(2);
      expect(nestedSet.conjunctions).toEqual([","]);
    });

    it("should parse nested parentheses", () => {
      const result = parseEcl("<< 404684003: ((363698007 = << 39057004))");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const outerNested = refined.refinement.items[0];
      expect(outerNested.type).toBe("NestedAttributeSet");
      const innerNested = outerNested.items[0];
      expect(innerNested.type).toBe("NestedAttributeSet");
      expect(innerNested.items[0].type).toBe("Attribute");
    });

    it("should parse parenthesized set inside attribute group", () => {
      const result = parseEcl("<< 404684003: { (363698007 = << 39057004 OR 116676008 = *) }");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const group = refined.refinement.items[0];
      expect(group.type).toBe("AttributeGroup");
      expect(group.items).toHaveLength(1);
      expect(group.items[0].type).toBe("NestedAttributeSet");
      expect(group.items[0].items).toHaveLength(2);
    });

    it("should parse mixed precedence with parentheses", () => {
      const result = parseEcl("<< 404684003: 111111 = * AND (222222 = * OR 333333 = *)");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      expect(refined.refinement.items).toHaveLength(2);
      expect(refined.refinement.items[0].type).toBe("Attribute");
      expect(refined.refinement.items[1].type).toBe("NestedAttributeSet");
      expect(refined.refinement.conjunctions).toEqual(["AND"]);
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

    it("should parse dotted path with long SCTIDs (not decimal)", () => {
      // Regression test: ensure SCTID.SCTID is not tokenized as a decimal value
      const result = parseEcl("<! 929360061000036106 . 127489000");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("SubExpression");
      const subExpr = result.ast as any;
      expect(subExpr.focusConcept.type).toBe("DottedAttributePath");
      expect(subExpr.focusConcept.base.focusConcept.sctId).toBe("929360061000036106");
      expect(subExpr.focusConcept.attributes[0].focusConcept.sctId).toBe("127489000");
    });

    it("should parse dotted path without spaces between long SCTIDs", () => {
      // Regression test: ensure SCTID.SCTID without spaces works
      const result = parseEcl("<!929360061000036106.127489000");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("SubExpression");
      const subExpr = result.ast as any;
      expect(subExpr.focusConcept.type).toBe("DottedAttributePath");
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

  describe("Numeric concrete domain values", () => {
    it("should parse integer concrete value", () => {
      const result = parseEcl("<< 123456789 : 111115 = #500");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should parse decimal concrete value", () => {
      const result = parseEcl("<< 123456789 : 111115 = #12.5");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should parse negative integer concrete value", () => {
      const result = parseEcl("<< 123456789 : 111115 = #-10");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should parse positive decimal with explicit sign", () => {
      const result = parseEcl("<< 123456789 : 111115 = #+3.14");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should parse user's original query", () => {
      const result = parseEcl(
        "<90332006:{<<127489000=387517004,999000041000168106=#500}"
      );
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should handle numeric comparison operators", () => {
      const result = parseEcl("<< 123456789 : 111115 > #100");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should handle >= operator with decimal", () => {
      const result = parseEcl("<< 123456789 : 111115 >= #50.5");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should handle <= operator", () => {
      const result = parseEcl("<< 123456789 : 111115 <= #200");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should handle < operator with decimal", () => {
      const result = parseEcl("<< 123456789 : 111115 < #75.25");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should handle != operator with zero", () => {
      const result = parseEcl("<< 123456789 : 111115 != #0");
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });
  });

  describe("String search terms in attributes", () => {
    it("should parse implicit match string", () => {
      const result = parseEcl('* : * = "heart"');
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("TypedSearchTerm");
      expect(attribute.value.searchType).toBe("match");
      expect(attribute.value.value).toBe("heart");
    });

    it("should parse explicit match prefix", () => {
      const result = parseEcl('* : * = match: "heart attack"');
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("TypedSearchTerm");
      expect(attribute.value.searchType).toBe("match");
      expect(attribute.value.value).toBe("heart attack");
    });

    it("should parse wild prefix", () => {
      const result = parseEcl('* : * = wild: "heart*"');
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("TypedSearchTerm");
      expect(attribute.value.searchType).toBe("wild");
      expect(attribute.value.value).toBe("heart*");
    });

    it("should parse search term set with multiple terms", () => {
      const result = parseEcl('* : * = ("heart" "liver")');
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("TypedSearchTermSet");
      expect(attribute.value.terms).toHaveLength(2);
      expect(attribute.value.terms[0].value).toBe("heart");
      expect(attribute.value.terms[1].value).toBe("liver");
    });

    it("should parse search term set with mixed search types", () => {
      const result = parseEcl('* : * = (match: "heart" wild: "pulm*")');
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("TypedSearchTermSet");
      expect(attribute.value.terms).toHaveLength(2);
      expect(attribute.value.terms[0].searchType).toBe("match");
      expect(attribute.value.terms[1].searchType).toBe("wild");
    });

    it("should parse string search term with concept attribute name", () => {
      const result = parseEcl('<< 404684003 : 363698007 = "liver"');
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("TypedSearchTerm");
      expect(attribute.value.value).toBe("liver");
    });

    it("should parse example from issue", () => {
      const result = parseEcl('* : * = "heart"');
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it("should parse example from issue with finding site", () => {
      const result = parseEcl('<< 404684003 : 363698007 |Finding site| = "liver"');
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });
  });

  describe("Boolean attribute values", () => {
    it("should parse boolean true as attribute value", () => {
      const result = parseEcl("* : * = true");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("BooleanValue");
      expect(attribute.value.value).toBe(true);
    });

    it("should parse boolean false as attribute value", () => {
      const result = parseEcl("<< 404684003 : 123456789 = false");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.value.type).toBe("BooleanValue");
      expect(attribute.value.value).toBe(false);
    });

    it("should parse boolean with != comparator", () => {
      const result = parseEcl("* : 123456789 != true");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const attribute = refined.refinement.items[0];
      expect(attribute.comparator).toBe("!=");
      expect(attribute.value.type).toBe("BooleanValue");
      expect(attribute.value.value).toBe(true);
    });

    it("should parse multiple attributes with boolean values", () => {
      const result = parseEcl("<< 404684003 : 123456789 = true, 987654321 = false");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      expect(refined.refinement.items).toHaveLength(2);
      expect(refined.refinement.items[0].value.type).toBe("BooleanValue");
      expect(refined.refinement.items[0].value.value).toBe(true);
      expect(refined.refinement.items[1].value.type).toBe("BooleanValue");
      expect(refined.refinement.items[1].value.value).toBe(false);
    });

    it("should parse boolean in attribute group", () => {
      const result = parseEcl("* : { 123456789 = true }");
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.type).toBe("RefinedExpression");
      const refined = result.ast as any;
      const group = refined.refinement.items[0];
      expect(group.type).toBe("AttributeGroup");
      expect(group.items[0].value.type).toBe("BooleanValue");
      expect(group.items[0].value.value).toBe(true);
    });
  });
});
