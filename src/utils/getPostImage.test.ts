import { describe, it, expect } from "vitest";
import { getPostImage } from "./getPostImage";

describe("getPostImage", () => {
  it("returns string ogImage directly", () => {
    expect(getPostImage("https://example.com/img.jpg", undefined)).toBe(
      "https://example.com/img.jpg"
    );
  });

  it("returns src from object ogImage", () => {
    expect(getPostImage({ src: "https://example.com/img.jpg" }, undefined)).toBe(
      "https://example.com/img.jpg"
    );
  });

  it("extracts first remote image from body when ogImage is absent", () => {
    const body = "Some text\n![alt](https://cdn.example.com/photo.png)\nmore text";
    expect(getPostImage(undefined, body)).toBe("https://cdn.example.com/photo.png");
  });

  it("ignores relative image paths in body", () => {
    const body = "![alt](./local-image.png)";
    expect(getPostImage(undefined, body)).toBeNull();
  });

  it("prefers ogImage over body image", () => {
    const body = "![alt](https://cdn.example.com/body-image.png)";
    expect(getPostImage("https://example.com/og.jpg", body)).toBe(
      "https://example.com/og.jpg"
    );
  });

  it("returns null when both ogImage and body are absent", () => {
    expect(getPostImage(undefined, undefined)).toBeNull();
  });

  it("returns null when body has no images", () => {
    expect(getPostImage(undefined, "Just plain text, no images.")).toBeNull();
  });
});
