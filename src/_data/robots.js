// @ts-check
import eleventyFetch from "@11ty/eleventy-fetch";

// Based on the tutorial and data:
// https://multiline.co/mment/2023/12/building-robots-txt/

export default async function () {
  const url = "https://api.ashur.cab/robots/v2.json";

  return eleventyFetch(url, {
    duration: "1d",
    type: "json",
  });
}
