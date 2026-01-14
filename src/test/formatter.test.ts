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
