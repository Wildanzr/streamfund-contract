import { promises as fs } from "fs";
import * as path from "path";

/**
 * Writes content to a .txt file, ensuring the directory exists.
 *
 * @param filePath - The path where the file should be saved.
 * @param content - The content to write to the file.
 */
export async function writeToFile(filePath: string, content: string): Promise<void> {
  try {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);

    // Ensure the directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(fullPath, content, "utf8");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}
