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
