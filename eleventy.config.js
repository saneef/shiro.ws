// @ts-check
import { EleventyRenderPlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginWebC from "@11ty/eleventy-plugin-webc";
import path from "path";
import filters from "./eleventy/filters.js";
import {
	cssTransforms,
	htmlTransforms,
	imageTransforms,
} from "./eleventy/transforms.js";
import { isProduction } from "./eleventy/utils.js";
import metadata from "./src/_data/metadata.js";

const site = metadata();

const INPUT_DIR = "src";
const OUTPUT_DIR = "dist";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebC, {
		components: "src/_components/**/*.webc",
	});

	eleventyConfig.addPlugin(filters);
	eleventyConfig.addPlugin(htmlTransforms);
	eleventyConfig.addPlugin(cssTransforms);
	eleventyConfig.addPlugin(imageTransforms, {
		eleventyInputDir: INPUT_DIR,
		imagesOutputDir: `${OUTPUT_DIR}/images/`,
	});
	eleventyConfig.addPlugin(EleventyRenderPlugin);
	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addShortcode("imageForRSS", async function (src, alt, sizes) {
		let metadata = await Image(path.join(INPUT_DIR, src), {
			outputDir: `${OUTPUT_DIR}/images/`,
			urlPath: `${site.url}/images/`,
			widths: [300, 600, 900],
			formats: ["avif", "webp", "jpeg"],
		});

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};
		return Image.generateHTML(metadata, imageAttributes);
	});

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
