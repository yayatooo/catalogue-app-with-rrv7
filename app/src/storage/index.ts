import { env } from "~/src/helper/env.server";
import type { StorageService } from "./storage.interface";
import { r2Storage } from "./r2.storage";
import { localStorage } from "./local.storage";

export const storage: StorageService =
  env.STORAGE_PROVIDER === "r2" ? r2Storage : localStorage;

export type { StorageService, UploadResult } from "./storage.interface";
