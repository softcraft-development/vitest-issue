import { describe, expect, it } from "vitest";
import { foo } from "../src";
describe("foo", function () {
    it("returns Foo", function () {
        expect(foo()).toBe("Foo");
    });
});
