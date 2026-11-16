import { mkdir, rmdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function createTemporaryAppPage(appDir, routeName, source) {
  const directory = join(appDir, routeName);
  await mkdir(directory); // Exclusive: refuse existing routes and their files.
  const page = join(directory, "page.tsx");
  try {
    await writeFile(page, source, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    await rmdir(directory);
    throw error;
  }
  return async () => {
    await unlink(page);
    await rmdir(directory); // Non-recursive: never remove another file.
  };
}
