import { Endpoint, S3 } from 'aws-sdk';
import config from 'config';
import retry from 'async-retry';
import { safeStringify } from './safeStringify';
import { log } from './logger';

const s3 = new S3({
  endpoint: new Endpoint(
    `${config.get('s3.protocol')}://${config.get('s3.host')}:${config.get(
      's3.port'
    )}`
  ),
  accessKeyId: config.get('s3.key'),
  secretAccessKey: config.get('s3.secret'),
  computeChecksums: true,
});

export const DEFAULT_RETRY_POLICY = {
  retries: 3,
  minTimeout: 2000,
};

export function getFileStream(key: string, bucket?: string) {
  return s3
    .getObject({
      Bucket: bucket || config.get('s3.bucket'),
      Key: key,
    })
    .createReadStream();
}

export async function headObject(key: string, bucket?: string) {
  return s3
    .headObject({
      Bucket: bucket || config.get('s3.bucket'),
      Key: key,
    })
    .promise();
}

export async function getObjectMetadata(key: string, bucket?: string) {
  return retry(async () => {
    try {
      const result = await s3
        .headObject({
          Bucket: bucket || config.get('s3.bucket'),
          Key: key,
        })
        .promise();
      return result;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return {};
      }
      log.error(safeStringify(error));
    }
  }, DEFAULT_RETRY_POLICY);
}
