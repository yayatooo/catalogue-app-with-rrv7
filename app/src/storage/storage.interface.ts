export type UploadResult = {
  key: string; // storage path, e.g. "products/uuid/abc-image.jpg"
  url: string; // public URL, e.g. "https://pub-xxx.r2.dev/products/uuid/abc-image.jpg"
};

export type UploadOptions = {
  contentType?: string;
  // Future-proof: cacheControl, metadata, etc.
};

export interface StorageService {
  upload(
    file: File,
    key: string,
    options?: UploadOptions,
  ): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  /** Reverse a public URL back to a storage key. Used when deleting. */
  urlToKey(url: string): string | null;
}
