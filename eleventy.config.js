// @ts-check
import { EleventyRenderPlugin } from "@11ty/eleventy";
import pluginWebC from "@11ty/eleventy-plugin-webc";

const INPUT_DIR = "src";
const OUTPUT_DIR = "dist";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebC, {
		components: "src/_components/**/*.webc",
	});
	eleventyConfig.addPlugin(EleventyRenderPlugin);

	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
	eleventyConfig.addPassthroughCopy("./src/images/remote/");

	return {
		dir: { input: INPUT_DIR, output: OUTPUT_DIR },
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
	};
}
