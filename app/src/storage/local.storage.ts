import { mkdir, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { env } from "~/src/helper/env.server";
import type {
  StorageService,
  UploadOptions,
  UploadResult,
} from "./storage.interface";

class LocalStorage implements StorageService {
  private readonly baseDir: string;
  private readonly publicPrefix = "/uploads"; // served by app/routes/uploads.$.tsx

  constructor() {
    this.baseDir = env.UPLOAD_DIR;
  }

  async upload(
    file: File,
    key: string,
    _options?: UploadOptions,
  ): Promise<UploadResult> {
    const fullPath = join(this.baseDir, key);
    await mkdir(dirname(fullPath), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    return {
      key,
      url: `${this.publicPrefix}/${key}`,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(join(this.baseDir, key));
    } catch (err) {
      // ENOENT (file already gone) is not a failure
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  urlToKey(url: string): string | null {
    if (!url.startsWith(this.publicPrefix + "/")) return null;
    return url.slice(this.publicPrefix.length + 1);
  }
}

export const localStorage = new LocalStorage();
