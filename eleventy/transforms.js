import pluginBundle from "@11ty/eleventy-plugin-bundle";
import browserslist from "browserslist";
import pluginImg2Picture from "eleventy-plugin-img2picture";
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

export function imageTransforms(
	eleventyConfig,
	{ eleventyInputDir, imagesOutputDir },
) {
	if (isProduction) {
		eleventyConfig.addPlugin(pluginImg2Picture, {
			eleventyInputDir,
			imagesOutputDir,
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
				progressive: true,
			},
			sharpWebpOptions: {
				quality: 95,
			},
		});
	}
}
