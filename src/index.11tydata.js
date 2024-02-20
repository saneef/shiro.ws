import metadata from "./_data/metadata.js";

export default {
	pagination: {
		data: "posts",
		size: 9,
	},
	permalink: function ({ pagination }) {
		if (pagination.pageNumber > 0) {
			return `page-${pagination.pageNumber + 1}/index.html`;
		}
		return "index.html";
	},
	eleventyComputed: {
		description: function ({ pagination }) {
			if (pagination.pageNumber === 0) {
				return metadata.subtitle;
			}
			return "";
		},
		title: function ({ pagination }) {
			const { pageNumber } = pagination;
			if (pageNumber > 0) {
				return `Page ${pageNumber + 1} – ${metadata.title}`;
			}
		},
	},
};
