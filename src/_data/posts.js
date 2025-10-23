// @ts-check
import { AssetCache } from "@11ty/eleventy-fetch";
import Image from "@11ty/eleventy-img";
import { Client, iteratePaginatedAPI } from "@notionhq/client";
import slugify from "@sindresorhus/slugify";
import { config } from "dotenv";
import { isProduction } from "../../eleventy/utils.js";
import {
	block2Markdown,
	block2PlainText,
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

const IMAGES_URL_PATH = "/images/remote/";
const IMAGES_OUTPUT_DIR = "./src/images/remote/";

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
		properties: {
			Title,
			Notes,
			"Published on": Published,
			Tags,
			Images,
			"Image Alt Texts": imageAltTexts,
			Options,
		},
	} = obj;

	const notes = block2Markdown(Notes);
	const title = block2Markdown(Title);
	const date = parseDateBlock(Published);
	const tags = parseMultiSelectBlock(Tags);
	const options = parseMultiSelectBlock(Options);
	const slug = slugify(title);
	let images = parseFilesBlock(Images);

	let altTexts = block2PlainText(imageAltTexts);
	altTexts = altTexts.split("\n\n");
	images = images.map((img, i) => {
		return {
			...img,
			altText: altTexts[i] ?? "",
		};
	});

	return { title, notes, date, tags, images, slug, options };
}

function createPosts(notionData) {
	const { results } = notionData;
	const imagePages = results
		.filter(
			(p) =>
				p?.object === "page" &&
				p?.archived === false &&
				p?.properties?.Images?.files.length > 0
		)
		.map(parseImagesPageData);
	return imagePages;
}

async function fetchRemoteImage(remoteUrl, altText) {
	const metadata = await Image(remoteUrl, {
		widths: [2600],
		outputDir: IMAGES_OUTPUT_DIR,
		urlPath: IMAGES_URL_PATH,
		formats: ["jpeg"],
		cacheOptions: {
			duration: CACHE_DURATION,
		},
		sharpJpegOptions: {
			quality: 100,
		},
	});

	const { width, height, url } = metadata?.jpeg?.[0] ?? {};

	return { width, height, url, altText };
}

async function fetchRemoteImages(posts) {
	return await Promise.all(
		posts.map(async (post) => {
			const localImages = await Promise.all(
				post?.images?.map(({ url, altText }) => fetchRemoteImage(url, altText)),
			);
			return { ...post, localImages };
		}),
	);
}

const now = new Date();
function isFuturePost(post) {
	return post.date > now;
}

export default async function () {
	const rawData = await getNotionPostsData();
	let posts = createPosts(rawData);

	posts = await fetchRemoteImages(posts);

	if (isProduction) {
		posts = posts.filter((p) => !isFuturePost(p));
	}

	return posts;
}
