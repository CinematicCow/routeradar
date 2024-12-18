import ignore from "ignore";
import path from 'path';
import fs from 'fs-extra';

export const getIgnoreFilter = async (dir: string): Promise<ReturnType<typeof ignore> | null> => {
  const getIgnorePath = path.join(dir, ".gitignore")

  try {
    const gitignoreContent = await fs.readFile(getIgnorePath, "utf8")
    return ignore().add(gitignoreContent)
  } catch (error) {
    console.warn("No .gitignore found or readable, proceeding without filter.")
    return null
  }
}


