import type { Response } from "node-fetch";

export function getFileNameFromContentDispostionHeader(
  res: Response,
  defaultFilename = "download.pdf",
): string {
  const header = res.headers.get("content-disposition") || "";
  const contentDispostion = header.split(";");
  const fileNameToken = "filename=";

  let fileName = defaultFilename;
  for (const thisValue of contentDispostion) {
    if (thisValue.trim().indexOf(fileNameToken) === 0) {
      fileName = decodeURIComponent(
        thisValue.trim().replace(fileNameToken, ""),
      );
      break;
    }
  }

  return fileName;
}

export function createContentDispositionHeader(filename: string): string {
  return `inline; filename=${filename}`;
}
