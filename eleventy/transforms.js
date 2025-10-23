import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginBundle from "@11ty/eleventy-plugin-bundle";
import browserslist from "browserslist";
import htmlmin from "html-minifier-terser";
import { browserslistToTargets, transform } from "lightningcss";
import { isProduction } from "./utils.js";

export function htmlTransforms(eleventyConfig) {
	eleventyConfig.addTransform("html-minify", (content, path) => {
		if (path && path.endsWith(".html") && isProduction) {
			return htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: false,
				collapseWhitespace: true,
				conservativeCollapse: true,
				minifyCSS: false,
			});
		}

		return content;
	});
}

export function cssTransforms(eleventyConfig) {
	eleventyConfig.addPlugin(pluginBundle, {
		transforms: [
			async function (content) {
				if (this.type === "css") {
					let { code } = await transform({
						code: Buffer.from(content),
						filename: this.page.outputPath,
						minify: isProduction,
						sourceMap: false,
						targets: browserslistToTargets(browserslist("> 0.2% and not dead")),
						drafts: {
							customMedia: true,
						},
					});
					return code;
				}
				return content;
			},
		],
	});
}

export function imageTransforms(eleventyConfig, options) {
	if (isProduction) {
		eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
			urlPath: "images",
			formats: ["avif", "webp", "jpeg"],
			widths: [300, 600, 900, 1200, 1500, 1800, 2100],
			defaultAttributes: {
				loading: "lazy",
				decoding: "async",
			},
		});
	}
}
