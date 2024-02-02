// @ts-check
import { EleventyRenderPlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginWebC from "@11ty/eleventy-plugin-webc";
import pluginImg2Picture from "eleventy-plugin-img2picture";
import filters from "./eleventy/filters.js";
import { cssTransforms, htmlTransforms } from "./eleventy/transforms.js";
import { isProduction } from "./eleventy/utils.js";

const INPUT_DIR = "src";
const OUTPUT_DIR = "dist";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebC, {
		components: "src/_components/**/*.webc",
	});

	eleventyConfig.addPlugin(filters);
	eleventyConfig.addPlugin(htmlTransforms);
	eleventyConfig.addPlugin(cssTransforms);
	eleventyConfig.addPlugin(EleventyRenderPlugin);
	eleventyConfig.addPlugin(pluginRss);
	if (isProduction) {
		eleventyConfig.addPlugin(pluginImg2Picture, {
			eleventyInputDir: INPUT_DIR,
			imagesOutputDir: `${OUTPUT_DIR}/images/`,
			urlPath: "/images/",
			minWidth: 250,
			maxWidth: 2050,
			widthStep: 150,
			fetchRemote: true,
			sharpAvifOptions: {
				quality: 70,
			},
			sharpJpegOptions: {
				quality: 90,
			},
			sharpWebpOptions: {
				quality: 95,
			},
		});
	}

	eleventyConfig.addJavaScriptFunction("isLandscape", function (width, height) {
		return height > width;
	});

	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
	eleventyConfig.addPassthroughCopy({ [`${INPUT_DIR}/public`]: "." });
	eleventyConfig.addPassthroughCopy("./src/fonts/*.woff2");

	if (!isProduction) {
		eleventyConfig.addPassthroughCopy("./src/images/remote");
	}

	return {
		dir: { input: INPUT_DIR, output: OUTPUT_DIR },
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
	};
}
