import { DateTime } from "luxon";

const filters = {
	// Formats date into a string
	date(date, format = "DD") {
		return DateTime.fromJSDate(date).toFormat(format);
	},

	readableDateFromISO(dateStr, formatStr = "FF") {
		return DateTime.fromISO(dateStr).toFormat(formatStr);
	},

	getFirstN(arr, n) {
		if (n === undefined) return arr;

		return arr.slice(0, n);
	},
};

export default function configFunction(eleventyConfig) {
	for (const prop in filters) {
		if (Object.hasOwn(filters, prop)) {
			eleventyConfig.addFilter(prop, filters[prop]);
		}
	}
}
