import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "~/src/helper/env.server";
import type {
  StorageService,
  UploadOptions,
  UploadResult,
} from "./storage.interface";

class R2Storage implements StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    // We assert these because env.server.ts already validated they exist when STORAGE_PROVIDER=r2
    this.client = new S3Client({
      region: "auto", // R2 ignores region but the SDK requires it
      endpoint: env.S3_CLIENTS!,
      credentials: {
        accessKeyId: env.ACCESS_KEY!,
        secretAccessKey: env.SECRET_KEY!,
      },
    });
    this.bucket = env.R2_BUCKET!;
    this.publicUrl = env.R2_PUBLIC_URL!.replace(/\/$/, "");
  }

  async upload(
    file: File,
    key: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const buffer = Buffer.from(await file.arrayBuffer());

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType:
          options?.contentType ?? file.type ?? "application/octet-stream",
        ContentLength: buffer.length,
      }),
    );

    return {
      key,
      url: `${this.publicUrl}/${key}`,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  urlToKey(url: string): string | null {
    if (!url.startsWith(this.publicUrl + "/")) return null;
    return url.slice(this.publicUrl.length + 1);
  }
}

export const r2Storage = new R2Storage();
