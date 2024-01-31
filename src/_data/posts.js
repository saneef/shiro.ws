// @ts-check
import { AssetCache } from "@11ty/eleventy-fetch";
import { Client, iteratePaginatedAPI } from "@notionhq/client";
import { config } from "dotenv";
import {
	block2Markdown,
	parseDateBlock,
	parseFilesBlock,
	parseMultiSelectBlock,
} from "../../lib/notion-utils.js";

config();

const apiKey = process.env.NOTION_API_KEY;
const pageId = process.env.NOTION_PAGE_ID;

// Matching the `expiry_time` of files URLs
// provided by Notion API
const CACHE_DURATION = "1h";

const notion = new Client({ auth: apiKey });

async function getNotionPostsData() {
	if (apiKey === undefined || pageId === undefined) {
		throw new Error("NOTION_API_KEY and NOTION_PAGE_ID is not provided");
	}

	const postsCache = new AssetCache("notion-image-gallery");

	if (postsCache.isCacheValid(CACHE_DURATION)) {
		console.log("Getting posts from cache.");
		return postsCache.getCachedValue();
	}

	console.log("Posts cache expired. Fetching data from Notion API");

	const responseJSON = await notion.databases.query({
		database_id: pageId,
		sorts: [{ property: "Published on", direction: "descending" }],
	});

	await postsCache.save(responseJSON, "json");

	return responseJSON;
}

function parseImagesPageData(obj) {
	const {
		properties: { Title, Notes, "Published on": Published, Tags, Images },
	} = obj;

	const notes = block2Markdown(Notes);
	const title = block2Markdown(Title);
	const publishedOn = parseDateBlock(Published);
	const tags = parseMultiSelectBlock(Tags);
	const images = parseFilesBlock(Images);

	return { title, notes, publishedOn, tags, images };
}

function createPosts(notionData) {
	const { results } = notionData;
	const imagePages = results
		.filter(
			(p) =>
				p?.object === "page" &&
				p?.archived === false &&
				p?.properties?.Images?.files.length > 0,
		)
		.map(parseImagesPageData);
	return imagePages;
}

export default async function () {
	const rawData = await getNotionPostsData();
	const posts = createPosts(rawData);
	return posts;
}
