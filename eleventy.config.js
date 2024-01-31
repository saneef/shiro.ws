// @ts-check
import { EleventyRenderPlugin } from "@11ty/eleventy";

const INPUT_DIR = "src";
const OUTPUT_DIR = "dist";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyRenderPlugin);

	return {
		dir: { input: INPUT_DIR, output: OUTPUT_DIR },
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
	};
}
