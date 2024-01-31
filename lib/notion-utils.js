function reverse(str) {
	return str.split("").reverse().join("");
}

function richText2Markdown(texts) {
	return texts
		.map((t) => {
			const {
				text: { content, link },
				annotations: { bold, italic, strikethrough, code },
			} = t;

			let prefix = "";
			let output = content;

			if (code) {
				prefix += "`";
			}

			if (strikethrough) {
				prefix += "~~";
			}

			if (italic) {
				prefix += "_";
			}

			if (bold) {
				prefix += "**";
			}

			if (link) {
				output = `[${content}](${link.url})`;
			}
			return prefix + output + reverse(prefix);
		})
		.join("");
}

export function block2Markdown(block) {
	const { type } = block;
	switch (type) {
		case "title":
			return richText2Markdown(block.title);
		case "rich_text":
			return richText2Markdown(block.rich_text);
		default:
			return;
	}
}

export function parseDateBlock(block) {
	if (block?.type === "date") {
		return new Date(block?.date?.start);
	}
}

export function parseMultiSelectBlock(block) {
	if (block?.type === "multi_select") {
		return block?.multi_select.map((t) => t.name);
	}
}

export function parseFileBlock(block) {
	if (block?.type === "file") {
		const { url, expiry_time } = block?.file;
		return { url, expiry: expiry_time };
	}
}

export function parseFilesBlock(block) {
	if (block?.type === "files") {
		return block?.files.map(parseFileBlock);
	}
}
