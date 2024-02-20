export default {
	pagination: {
		data: "posts",
		size: 1,
		alias: "post",
	},
	permalink: function ({ post }) {
		return `/posts/${post.slug}/`;
	},
	eleventyComputed: {
		title: function ({ post }) {
			return post.title;
		},
	},
};
