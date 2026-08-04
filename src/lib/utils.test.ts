import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  formatTime,
  formatCPF,
  formatPhone,
  slugify,
  initials,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });
});

describe("formatCurrency", () => {
  it("formats BRL values", () => {
    expect(formatCurrency(1234.56)).toContain("1.234");
    expect(formatCurrency(1234.56)).toContain("56");
  });

  it("handles null/undefined", () => {
    expect(formatCurrency(null)).toBe("R$ 0,00");
    expect(formatCurrency(undefined)).toBe("R$ 0,00");
  });

  it("handles string values", () => {
    expect(formatCurrency("100")).toContain("100");
  });
});

describe("formatDate", () => {
  it("formats dates in pt-BR", () => {
    const result = formatDate(new Date("2024-01-15"));
    expect(result).toBe("15/01/2024");
  });

  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
  });
});

describe("formatTime", () => {
  it("formats time in pt-BR", () => {
    const result = formatTime(new Date("2024-01-15T14:30:00"));
    expect(result).toMatch(/14:30/);
  });
});

describe("formatCPF", () => {
  it("formats CPF", () => {
    expect(formatCPF("12345678900")).toBe("123.456.789-00");
  });
});

describe("formatPhone", () => {
  it("formats phone with DDD", () => {
    expect(formatPhone("11988881234")).toBe("(11) 98888-1234");
  });

  it("formats landline", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("slugify", () => {
  it("creates URL-safe slug", () => {
    expect(slugify("Clínica Saúde")).toBe("clinica-saude");
    expect(slugify("  Espaços  ")).toBe("espacos");
    expect(slugify("AcentuaçãoÇÃO")).toBe("acentuacaocao");
  });
});

describe("initials", () => {
  it("returns first two initials", () => {
    expect(initials("Maria Silva")).toBe("MS");
    expect(initials("João")).toBe("JO");
  });

  it("handles empty name", () => {
    expect(initials("")).toBe("");
  });
});