import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/preact";
import { useStored } from "./useStored";

describe("useStored", () => {
  beforeEach(() => localStorage.clear());

  it("usa el valor inicial si no hay nada guardado", () => {
    const { result } = renderHook(() => useStored("k", { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("persiste los cambios", () => {
    const { result } = renderHook(() => useStored("k", { a: 1 }));
    act(() => result.current[1]({ a: 2 }));
    expect(result.current[0]).toEqual({ a: 2 });
    expect(JSON.parse(localStorage.getItem("k")!)).toEqual({ a: 2 });
  });

  it("mezcla lo guardado con los valores por defecto nuevos", () => {
    localStorage.setItem("k", JSON.stringify({ a: 5 }));
    const { result } = renderHook(() => useStored("k", { a: 1, b: 2 }));
    expect(result.current[0]).toEqual({ a: 5, b: 2 });
  });

  it("los arrays se restauran tal cual", () => {
    localStorage.setItem("k", JSON.stringify([1, 2]));
    const { result } = renderHook(() => useStored<number[]>("k", []));
    expect(result.current[0]).toEqual([1, 2]);
  });

  it("ignora JSON corrupto", () => {
    localStorage.setItem("k", "{oops");
    const { result } = renderHook(() => useStored("k", { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });
});
