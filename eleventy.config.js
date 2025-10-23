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
import site from "./src/_data/metadata.js";

const INPUT_DIR = "src";
const OUTPUT_DIR = "dist";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebC, {
		components: "src/_components/**/*.webc",
	});

	eleventyConfig.addPlugin(filters);
	eleventyConfig.addPlugin(htmlTransforms);
	eleventyConfig.addPlugin(cssTransforms);
	eleventyConfig.addPlugin(imageTransforms);
	eleventyConfig.addPlugin(EleventyRenderPlugin);
	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addShortcode("imageForRSS", async function (src, alt) {
		let metadata = await Image(path.join(INPUT_DIR, src), {
			outputDir: `${OUTPUT_DIR}/images/`,
			urlPath: "images",
			widths: [900],
			formats: ["jpeg"],
		});

		let data = metadata?.jpeg?.[metadata?.jpeg?.length - 1];
		return `<img src="${site.url}${data?.url}" width="${data?.width}" height="${data?.height}" alt="${alt}" loading="lazy" decoding="async">`;
	});

	eleventyConfig.addJavaScriptFunction("isLandscape", function (width, height) {
		return width >= height;
	});

	eleventyConfig.addJavaScriptFunction(
		"layout",
		function (options, prefix = "layout-") {
			return options
				.filter((o) => o.startsWith(prefix))
				.map((o) => o.replace(prefix, ""))
				.join(" ");
		}
	);

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
