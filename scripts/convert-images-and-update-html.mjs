import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const imageExtRe = /\.(png|jpe?g)$/i;
const htmlExtRe = /\.html$/i;

async function walk(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === "node_modules" || entry.name === ".git") {
				continue;
			}
			files.push(...(await walk(fullPath)));
		} else {
			files.push(fullPath);
		}
	}

	return files;
}

function srcUrlToFsPath(htmlFilePath, srcUrl) {
	const cleaned = srcUrl.split("?")[0].split("#")[0];
	if (!cleaned || /^(https?:|data:|blob:|\/\/)/i.test(cleaned)) {
		return null;
	}

	const decoded = decodeURIComponent(cleaned);
	return path.resolve(path.dirname(htmlFilePath), decoded);
}

function replaceExtInUrl(srcUrl, newExt) {
	const parts = srcUrl.split(/([?#].*)/);
	const base = parts[0];
	const suffix = parts[1] || "";
	return base.replace(/\.(png|jpe?g)$/i, `.${newExt}`) + suffix;
}

async function fileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function convertImages(imageFiles) {
	let converted = 0;
	const failed = [];

	for (const filePath of imageFiles) {
		try {
			const parsed = path.parse(filePath);
			const avifPath = path.join(parsed.dir, `${parsed.name}.avif`);
			const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);

			await sharp(filePath, { animated: false }).avif({ quality: 50, effort: 4 }).toFile(avifPath);
			await sharp(filePath, { animated: false }).webp({ quality: 75, effort: 4 }).toFile(webpPath);
			converted += 1;
		} catch (error) {
			failed.push({ filePath, error: String(error?.message || error) });
		}
	}

	return { converted, failed };
}

async function updateHtmlFiles(htmlFiles) {
	let updatedCount = 0;

	for (const htmlFile of htmlFiles) {
		const original = await fs.readFile(htmlFile, "utf8");
		let changed = false;

		const updated = original.replace(/<img\b[^>]*>/gi, (imgTag, offset, fullText) => {
			const srcMatch = imgTag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i);
			if (!srcMatch) {
				return imgTag;
			}

			const src = srcMatch[2];
			if (!imageExtRe.test(src)) {
				return imgTag;
			}

			const previousChunk = fullText.slice(Math.max(0, offset - 120), offset).toLowerCase();
			if (previousChunk.includes("<picture")) {
				return imgTag;
			}

			const sourcePath = srcUrlToFsPath(htmlFile, src);
			if (!sourcePath) {
				return imgTag;
			}

			const parsed = path.parse(sourcePath);
			const avifPath = path.join(parsed.dir, `${parsed.name}.avif`);
			const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);

			const avifExists = fsSync.existsSync(avifPath);
			const webpExists = fsSync.existsSync(webpPath);
			if (!avifExists || !webpExists) {
				return imgTag;
			}

			const avifSrc = replaceExtInUrl(src, "avif");
			const webpSrc = replaceExtInUrl(src, "webp");
			changed = true;

			return `<picture>\n        <source srcset="${avifSrc}" type="image/avif">\n        <source srcset="${webpSrc}" type="image/webp">\n        ${imgTag}\n    </picture>`;
		});

		if (changed && updated !== original) {
			await fs.writeFile(htmlFile, updated, "utf8");
			updatedCount += 1;
		}
	}

	return updatedCount;
}

async function main() {
	const allFiles = await walk(rootDir);
	const imageFiles = allFiles.filter((file) => imageExtRe.test(file));
	const htmlFiles = allFiles.filter((file) => htmlExtRe.test(file));

	const conversion = await convertImages(imageFiles);
	const htmlUpdated = await updateHtmlFiles(htmlFiles);
	const report = {
		rootDir,
		sourceImages: imageFiles.length,
		convertedImages: conversion.converted,
		failedImages: conversion.failed,
		htmlFiles: htmlFiles.length,
		htmlUpdated,
	};

	await fs.writeFile(path.join(rootDir, "conversion-report.json"), JSON.stringify(report, null, 2), "utf8");

	console.log(`Images converties: ${conversion.converted}`);
	console.log(`Pages HTML mises a jour: ${htmlUpdated}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
