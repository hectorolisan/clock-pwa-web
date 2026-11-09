import { describe, expect, it } from "vitest";
import { formatDuration, formatHHMM, pad, zoneCity, zoneOffset } from "./time";

describe("pad", () => {
  it("rellena con ceros y trunca decimales", () => {
    expect(pad(5)).toBe("05");
    expect(pad(7.9)).toBe("07");
    expect(pad(3, 3)).toBe("003");
    expect(pad(123)).toBe("123");
  });
});

describe("formatDuration", () => {
  it("formatea minutos y segundos", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(65_000)).toBe("01:05");
  });

  it("añade horas solo si hacen falta o se fuerzan", () => {
    expect(formatDuration(3_661_000)).toBe("01:01:01");
    expect(formatDuration(5_000, { hours: true })).toBe("00:00:05");
  });

  it("añade centésimas", () => {
    expect(formatDuration(1_234, { centis: true })).toBe("00:01.23");
  });

  it("no muestra negativos", () => {
    expect(formatDuration(-500)).toBe("00:00");
  });
});

describe("formatHHMM", () => {
  it("deja igual en 24 h", () => {
    expect(formatHHMM("19:30", true)).toBe("19:30");
  });

  it("convierte a 12 h", () => {
    expect(formatHHMM("19:30", false)).toBe("07:30 PM");
    expect(formatHHMM("00:05", false)).toBe("12:05 AM");
    expect(formatHHMM("12:00", false)).toBe("12:00 PM");
  });
});

describe("zoneOffset", () => {
  it("devuelve minutos respecto a UTC", () => {
    const winter = new Date(Date.UTC(2026, 0, 15));
    expect(zoneOffset("UTC", winter)).toBe(0);
    expect(zoneOffset("Asia/Kolkata", winter)).toBe(330);
    expect(zoneOffset("America/New_York", winter)).toBe(-300);
    expect(zoneOffset("Atlantic/Canary", winter)).toBe(0);
  });
});

describe("zoneCity", () => {
  it("toma el último segmento sin guiones bajos", () => {
    expect(zoneCity("America/Argentina/Buenos_Aires")).toBe("Buenos Aires");
  });
});
