import { formatEcl } from "../formatter/format";
import { FormattingOptions } from "../formatter/rules";

const options: FormattingOptions = { indentSize: 2 };

describe("ECL Formatter", () => {
  describe("Simple expressions", () => {
    it("should preserve simple concept reference", () => {
      const input = "404684003 |Clinical finding|";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("404684003 |Clinical finding|");
    });

    it("should preserve concept ID without term", () => {
      const input = "404684003";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("404684003");
    });

    it("should format constraint operator with space", () => {
      const input = "<<404684003";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003");
    });

    it("should preserve wildcard", () => {
      const input = "*";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("*");
    });

    it("should format constraint with wildcard", () => {
      const input = "<<*";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< *");
    });
  });

  describe("Compound expressions", () => {
    it("should keep simple AND inline", () => {
      const input = "<< 404684003 AND << 987654321";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003 AND << 987654321");
    });

    it("should keep simple OR inline", () => {
      const input = "<< 404684003 OR << 987654321";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003 OR << 987654321");
    });

    it("should keep simple MINUS inline", () => {
      const input = "<< 404684003 MINUS << 987654321";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003 MINUS << 987654321");
    });

    it("should accept lowercase 'and' and normalize to uppercase", () => {
      const input = "<< 404684003 and << 987654321";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003 AND << 987654321");
    });

    it("should accept lowercase 'or' and normalize to uppercase", () => {
      const input = "<< 404684003 or << 987654321";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003 OR << 987654321");
    });

    it("should accept lowercase 'minus' and normalize to uppercase", () => {
      const input = "<< 404684003 minus << 987654321";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003 MINUS << 987654321");
    });

    it("should accept mixed case keywords and normalize to uppercase", () => {
      const input = "<< 404684003 And << 987654321 Or << 123456789";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("AND");
      expect(result.formatted).toContain("OR");
    });

    it("should handle nested expression with lowercase keywords", () => {
      const input = "(<< 246061005 minus (<< 116680003 or << 127489000))";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      // Verify keywords are normalized to uppercase
      expect(result.formatted).toContain("MINUS");
      expect(result.formatted).toContain("OR");
      expect(result.formatted).not.toContain("minus");
      expect(result.formatted).not.toContain("or");
    });
  });

  describe("Refinements", () => {
    it("should keep simple refinement inline", () => {
      const input = "<< 404684003: 363698007 = << 39057004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("<< 404684003: 363698007 = << 39057004");
    });

    it("should break multiple attributes onto separate lines", () => {
      const input = "<< 404684003: 363698007 = << 39057004, 116676008 = << 55641003";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("\n");
    });

    it("should format attribute group", () => {
      const input = "<< 404684003: { 363698007 = << 39057004 }";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("{ ");
      expect(result.formatted).toContain(" }");
    });

    it("should break attribute group with multiple attributes", () => {
      const input = "<< 404684003: { 363698007 = << 39057004, 116676008 = << 55641003 }";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("{\n");
    });

    it("should handle attribute name with constraint operator", () => {
      const input = "<< 404684003: << 127489000 = *";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("<< 127489000");
    });

    it("should handle memberOf with cardinality and constrained attribute name", () => {
      const input = "^ 929360071000036103: [4..*] << 127489000 = *";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("[4..*]");
      expect(result.formatted).toContain("<< 127489000");
    });
  });

  describe("Cardinality", () => {
    it("should format cardinality", () => {
      const input = "<< 404684003: [1..3] 363698007 = << 39057004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("[1..3]");
    });

    it("should format cardinality with wildcards", () => {
      const input = "<< 404684003: [0..*] 363698007 = *";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("[0..*]");
    });
  });

  describe("Reverse attribute flags", () => {
    it("should parse and format brief reverse flag (R)", () => {
      const input = "<< 404684003: R 363698007 = << 39057004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("R 363698007");
    });

    it("should accept lowercase r and normalize to uppercase R", () => {
      const input = "<< 404684003: r 363698007 = << 39057004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("R 363698007");
    });

    it("should parse long-form reverseOf keyword", () => {
      const input = "<< 404684003: reverseOf 363698007 = << 39057004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("R 363698007");
    });

    it("should handle reverse flag with cardinality", () => {
      const input = "<< 404684003: [1..*] R 363698007 = << 39057004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("[1..*] R 363698007");
    });

    it("should format complex example from ECL spec", () => {
      const input = "< 91723000 : R 363698007 = < 125605004";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("R 363698007");
    });

    it("should handle multiple reverse attributes", () => {
      const input = "<< 404684003 : R 363698007 = << 39057004, R 116676008 = << 55641003";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("R 363698007");
      expect(result.formatted).toContain("R 116676008");
    });
  });

  describe("Dotted attributes", () => {
    it("should parse simple dotted attribute", () => {
      const input = "< 125605004 . 363698007";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain(" . ");
    });

    it("should parse chained dotted attributes", () => {
      const input = "<< 19829001 . < 47429007 . 363698007";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain(" . ");
      // Should have two dots
      expect((result.formatted?.match(/\s\.\s/g) || []).length).toBe(2);
    });

    it("should handle dotted with constraint operators", () => {
      const input = "< 125605004 . << 363698007";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("< 125605004 . << 363698007");
    });

    it("should format dotted path from ECL spec example", () => {
      const input = "< 27658006 . 127489000";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain(" . ");
    });

    it("should handle nested parentheses with dots", () => {
      const input = "((< 19829001) . < 47429007) . 363698007";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain(" . ");
    });
  });

  describe("Nested expressions", () => {
    it("should preserve parentheses", () => {
      const input = "(<< 404684003)";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toBe("(<< 404684003)");
    });

    it("should format complex nested expression", () => {
      const input = "(<< 404684003) AND (<< 987654321)";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      // Nested expressions make it complex, should break
      expect(result.formatted).toContain("AND");
    });
  });

  describe("Filters", () => {
    it("should format term filter", () => {
      const input = '<< 404684003 {{ term = "heart" }}';
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain('{{ term = "heart" }}');
    });

    it("should format dialect filter", () => {
      const input = "<< 404684003 {{ dialect = en-US }}";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("{{ dialect = en-US }}");
    });

    it("should format type filter", () => {
      const input = "<< 404684003 {{ type = PREFERRED }}";
      const result = formatEcl(input, options);
      expect(result.error).toBeNull();
      expect(result.formatted).toContain("{{ type = PREFERRED }}");
    });
  });

  describe("Idempotency", () => {
    it("should be idempotent for simple expression", () => {
      const input = "<< 404684003 |Clinical finding|";
      const first = formatEcl(input, options);
      const second = formatEcl(first.formatted!, options);
      expect(second.formatted).toBe(first.formatted);
    });

    it("should be idempotent for compound expression", () => {
      const input = "(<< 404684003: 363698007 = << 39057004) AND << 987654321";
      const first = formatEcl(input, options);
      const second = formatEcl(first.formatted!, options);
      expect(second.formatted).toBe(first.formatted);
    });

    it("should be idempotent for refinement", () => {
      const input = "<< 404684003: { 363698007 = << 39057004, 116676008 = << 55641003 }";
      const first = formatEcl(input, options);
      const second = formatEcl(first.formatted!, options);
      expect(second.formatted).toBe(first.formatted);
    });
  });

  describe("Error handling", () => {
    it("should return error for invalid ECL", () => {
      const input = "<<< invalid syntax";
      const result = formatEcl(input, options);
      expect(result.formatted).toBeNull();
      expect(result.error).not.toBeNull();
    });

    it("should return error for empty input", () => {
      const input = "";
      const result = formatEcl(input, options);
      expect(result.formatted).toBeNull();
    });
  });
});
