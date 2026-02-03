import { tokenize } from "../parser/lexer";

describe("ECL Lexer", () => {
  describe("Whitespace and comments", () => {
    it("should skip whitespace tokens", () => {
      const result = tokenize("  \t\n  ");
      expect(result.tokens).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should skip block comments", () => {
      const result = tokenize("/* This is a comment */");
      expect(result.tokens).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should skip multi-line block comments", () => {
      const result = tokenize("/* This is\na multi-line\ncomment */");
      expect(result.tokens).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should preserve tokens around comments", () => {
      const result = tokenize("404684003 /* comment */ AND 123456789");
      expect(result.tokens).toHaveLength(3);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
      expect(result.tokens[1].tokenType.name).toBe("And");
      expect(result.tokens[2].tokenType.name).toBe("SctId");
    });
  });

  describe("Concept references", () => {
    it("should tokenize SCTID (6 digits)", () => {
      const result = tokenize("404684");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
      expect(result.tokens[0].image).toBe("404684");
    });

    it("should tokenize SCTID (9 digits)", () => {
      const result = tokenize("404684003");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
      expect(result.tokens[0].image).toBe("404684003");
    });

    it("should tokenize SCTID (18 digits - maximum)", () => {
      const result = tokenize("123456789012345678");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
      expect(result.tokens[0].image).toBe("123456789012345678");
    });

    it("should tokenize SCTID with term", () => {
      const result = tokenize("404684003 |Clinical finding|");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
      expect(result.tokens[0].image).toBe("404684003");
      expect(result.tokens[1].tokenType.name).toBe("TermString");
      expect(result.tokens[1].image).toBe("|Clinical finding|");
    });

    it("should tokenize term with special characters", () => {
      const result = tokenize("|Pulmonary emphysema (disorder)|");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("TermString");
      expect(result.tokens[0].image).toBe("|Pulmonary emphysema (disorder)|");
    });

    it("should tokenize empty term", () => {
      const result = tokenize("404684003 ||");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[1].tokenType.name).toBe("TermString");
      expect(result.tokens[1].image).toBe("||");
    });

    it("should tokenize wildcard", () => {
      const result = tokenize("*");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Wildcard");
    });
  });

  describe("Constraint operators (brief syntax)", () => {
    it("should tokenize descendantOf (<)", () => {
      const result = tokenize("<");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOf");
    });

    it("should tokenize descendantOrSelfOf (<<)", () => {
      const result = tokenize("<<");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOrSelfOf");
    });

    it("should tokenize childOf (<!)", () => {
      const result = tokenize("<!");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ChildOf");
    });

    it("should tokenize childOrSelfOf (<<!)", () => {
      const result = tokenize("<<!");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ChildOrSelfOf");
    });

    it("should tokenize ancestorOf (>)", () => {
      const result = tokenize(">");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("AncestorOf");
    });

    it("should tokenize ancestorOrSelfOf (>>)", () => {
      const result = tokenize(">>");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("AncestorOrSelfOf");
    });

    it("should tokenize parentOf (>!)", () => {
      const result = tokenize(">!");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ParentOf");
    });

    it("should tokenize parentOrSelfOf (>>!)", () => {
      const result = tokenize(">>!");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ParentOrSelfOf");
    });

    it("should tokenize memberOf (^)", () => {
      const result = tokenize("^");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("MemberOf");
    });

    it("should tokenize combined operators without whitespace (<<^)", () => {
      const result = tokenize("<<^929360071000036103");
      expect(result.tokens).toHaveLength(3);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOrSelfOf");
      expect(result.tokens[0].image).toBe("<<");
      expect(result.tokens[1].tokenType.name).toBe("MemberOf");
      expect(result.tokens[1].image).toBe("^");
      expect(result.tokens[2].tokenType.name).toBe("SctId");
      expect(result.tokens[2].image).toBe("929360071000036103");
    });
  });

  describe("Constraint operators (long-form syntax)", () => {
    it("should tokenize descendantOf keyword", () => {
      const result = tokenize("descendantOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOfKeyword");
    });

    it("should tokenize descendantOrSelfOf keyword", () => {
      const result = tokenize("descendantOrSelfOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOrSelfOfKeyword");
    });

    it("should tokenize childOf keyword", () => {
      const result = tokenize("childOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ChildOfKeyword");
    });

    it("should tokenize childOrSelfOf keyword", () => {
      const result = tokenize("childOrSelfOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ChildOrSelfOfKeyword");
    });

    it("should tokenize ancestorOf keyword", () => {
      const result = tokenize("ancestorOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("AncestorOfKeyword");
    });

    it("should tokenize ancestorOrSelfOf keyword", () => {
      const result = tokenize("ancestorOrSelfOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("AncestorOrSelfOfKeyword");
    });

    it("should tokenize parentOf keyword", () => {
      const result = tokenize("parentOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ParentOfKeyword");
    });

    it("should tokenize parentOrSelfOf keyword", () => {
      const result = tokenize("parentOrSelfOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ParentOrSelfOfKeyword");
    });

    it("should tokenize memberOf keyword", () => {
      const result = tokenize("memberOf");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("MemberOfKeyword");
    });
  });

  describe("Logical operators", () => {
    it("should tokenize AND", () => {
      const result = tokenize("AND");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("And");
    });

    it("should tokenize OR", () => {
      const result = tokenize("OR");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Or");
    });

    it("should tokenize MINUS", () => {
      const result = tokenize("MINUS");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Minus");
    });

    it("should tokenize compound expression with AND", () => {
      const result = tokenize("<< 404684003 AND << 123456789");
      expect(result.tokens).toHaveLength(5);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOrSelfOf");
      expect(result.tokens[1].tokenType.name).toBe("SctId");
      expect(result.tokens[2].tokenType.name).toBe("And");
      expect(result.tokens[3].tokenType.name).toBe("DescendantOrSelfOf");
      expect(result.tokens[4].tokenType.name).toBe("SctId");
    });
  });

  describe("Comparison operators", () => {
    it("should tokenize equals (=)", () => {
      const result = tokenize("=");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Equals");
    });

    it("should tokenize not-equals (!=)", () => {
      const result = tokenize("!=");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("NotEquals");
    });

    it("should tokenize less-than-or-equals (<=)", () => {
      const result = tokenize("<=");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("LessThanOrEquals");
    });

    it("should tokenize greater-than-or-equals (>=)", () => {
      const result = tokenize(">=");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("GreaterThanOrEquals");
    });
  });

  describe("Delimiters", () => {
    it("should tokenize parentheses", () => {
      const result = tokenize("()");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].tokenType.name).toBe("LParen");
      expect(result.tokens[1].tokenType.name).toBe("RParen");
    });

    it("should tokenize braces", () => {
      const result = tokenize("{}");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].tokenType.name).toBe("LBrace");
      expect(result.tokens[1].tokenType.name).toBe("RBrace");
    });

    it("should tokenize double braces", () => {
      const result = tokenize("{{}}");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].tokenType.name).toBe("DoubleLBrace");
      expect(result.tokens[1].tokenType.name).toBe("DoubleRBrace");
    });

    it("should tokenize brackets", () => {
      const result = tokenize("[]");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].tokenType.name).toBe("LBracket");
      expect(result.tokens[1].tokenType.name).toBe("RBracket");
    });

    it("should tokenize colon", () => {
      const result = tokenize(":");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Colon");
    });

    it("should tokenize comma", () => {
      const result = tokenize(",");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Comma");
    });

    it("should tokenize hash", () => {
      const result = tokenize("#");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Hash");
    });

    it("should tokenize dot-dot", () => {
      const result = tokenize("..");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DotDot");
    });

    it("should tokenize dot", () => {
      const result = tokenize(".");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Dot");
    });

    it("should tokenize pipe", () => {
      const result = tokenize("|");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Pipe");
    });
  });

  describe("Literals", () => {
    it("should tokenize integer", () => {
      const result = tokenize("123");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Integer");
    });

    it("should distinguish SCTID from integer", () => {
      const sctidResult = tokenize("404684003");
      expect(sctidResult.tokens[0].tokenType.name).toBe("SctId");

      const intResult = tokenize("123");
      expect(intResult.tokens[0].tokenType.name).toBe("Integer");
    });

    it("should tokenize string literal", () => {
      const result = tokenize('"heart attack"');
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("StringLiteral");
      expect(result.tokens[0].image).toBe('"heart attack"');
    });

    it("should tokenize string literal with escaped quotes", () => {
      const result = tokenize('"say \\"hello\\""');
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("StringLiteral");
    });

    it("should tokenize boolean true", () => {
      const result = tokenize("true");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("True");
    });

    it("should tokenize boolean false", () => {
      const result = tokenize("false");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("False");
    });

    it("should tokenize dialect alias", () => {
      const result = tokenize("en-US");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DialectAlias");
    });

    it("should tokenize identifier", () => {
      const result = tokenize("LOINC");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Identifier");
    });

    it("should tokenize alternate ID code", () => {
      const result = tokenize("54486-6");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("AlternateIdCode");
    });
  });

  describe("Filter keywords", () => {
    it("should tokenize term keyword", () => {
      const result = tokenize("term");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("TermKeyword");
    });

    it("should tokenize language keyword", () => {
      const result = tokenize("language");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Language");
    });

    it("should tokenize type keyword", () => {
      const result = tokenize("type");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("TypeKeyword");
    });

    it("should tokenize moduleId keyword", () => {
      const result = tokenize("moduleId");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ModuleId");
    });

    it("should tokenize effectiveTime keyword", () => {
      const result = tokenize("effectiveTime");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("EffectiveTime");
    });

    it("should tokenize active keyword", () => {
      const result = tokenize("active");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Active");
    });

    it("should tokenize definitionStatusId keyword", () => {
      const result = tokenize("definitionStatusId");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DefinitionStatusId");
    });

    it("should tokenize PREFERRED keyword", () => {
      const result = tokenize("PREFERRED");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Preferred");
    });

    it("should tokenize match keyword", () => {
      const result = tokenize("match");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Match");
    });

    it("should tokenize wild keyword", () => {
      const result = tokenize("wild");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Wild");
    });
  });

  describe("Edge cases", () => {
    it("should handle long SCTID at boundary (18 digits)", () => {
      const result = tokenize("123456789012345678");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
    });

    it("should handle 19+ digits as SCTID + Integer", () => {
      const result = tokenize("1234567890123456789");
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].tokenType.name).toBe("SctId");
      expect(result.tokens[1].tokenType.name).toBe("Integer");
    });

    it("should handle short number as Integer", () => {
      const result = tokenize("12345");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("Integer");
    });

    it("should handle term with numbers and symbols", () => {
      const result = tokenize("|Type 2 diabetes mellitus (disorder)|");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("TermString");
    });

    it("should handle empty input", () => {
      const result = tokenize("");
      expect(result.tokens).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should correctly order << before <", () => {
      const result = tokenize("<<");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DescendantOrSelfOf");
    });

    it("should correctly order <<! before <<", () => {
      const result = tokenize("<<!");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("ChildOrSelfOf");
    });

    it("should correctly order {{ before {", () => {
      const result = tokenize("{{");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DoubleLBrace");
    });

    it("should correctly order .. before .", () => {
      const result = tokenize("..");
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].tokenType.name).toBe("DotDot");
    });
  });

  describe("Real-world ECL examples", () => {
    it("should tokenize simple descendant constraint", () => {
      const result = tokenize("<< 73211009 |Diabetes mellitus|");
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should tokenize refinement with multiple attributes", () => {
      const result = tokenize(
        "<< 404684003: 363698007 = << 39057004, 116676008 = << 72704001"
      );
      expect(result.errors).toHaveLength(0);
    });

    it("should tokenize attribute group expression", () => {
      const result = tokenize(
        "<< 64572001: { 363698007 = << 39057004, 116676008 = << 72704001 }"
      );
      expect(result.errors).toHaveLength(0);
    });

    it("should tokenize filter with term matching", () => {
      const result = tokenize('<< 404684003 {{ term = "heart" }}');
      expect(result.errors).toHaveLength(0);
    });

    it("should tokenize complex compound expression", () => {
      const result = tokenize(
        "(<< 404684003: 363698007 = << 39057004) AND (<< 64572001)"
      );
      expect(result.errors).toHaveLength(0);
    });
  });
});
