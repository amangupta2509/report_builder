import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function main() {
  const sourceUrl =
    getArg("--url") ??
    process.env.PDF_SOURCE_URL ??
    "http://127.0.0.1:3000/report/pdf";
  const outputPath = path.resolve(
    getArg("--output") ?? process.env.PDF_OUTPUT_PATH ?? "report.pdf",
  );

  const browser = await puppeteer.launch({
    headless: true,
    args:
      process.platform === "linux"
        ? ["--no-sandbox", "--disable-setuid-sandbox"]
        : [],
  });

  try {
    const page = await browser.newPage();

    const cookieHeader = process.env.PDF_COOKIE;
    if (cookieHeader) {
      await page.setExtraHTTPHeaders({
        cookie: cookieHeader,
      });
    }

    await page.goto(sourceUrl, { waitUntil: "networkidle0" });

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`PDF written to ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("PDF export failed:", error);
  process.exit(1);
});
