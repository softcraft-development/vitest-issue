import { describe, expect, it } from "vitest"
import { foo } from "../src"

describe("foo", () => {
  it("returns Foo", () => {
    expect(foo()).toBe("Foo")
  })
})