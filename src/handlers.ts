import { Request, Response } from 'express';
import { pipeline } from 'stream';
import { log } from './utils/logger';
import { getFileStream, getObjectMetadata } from './utils/s3Downloader';
import { safeStringify } from './utils/safeStringify';

export async function isUploaded(request: Request, response: Response) {
  const { chunkId } = request.params;
  if (!chunkId) {
    const errMsg = 'Request is missing the required `chunkId` param.';
    log.error(`Route: is_uploaded/:chunkId, Error: ${errMsg}`);
    return response.status(400).json({ status: 'error', code: 400, errMsg });
  }
  const objInfo = await getObjectMetadata(chunkId);
  if (objInfo.ETag) {
    response.json({ status: 'ok', code: 200 });
  } else {
    response.sendStatus(404);
  }
}

export async function health(_, res) {
  res.sendStatus(200);
}

export async function getFileFromS3(req: Request, res: Response) {
  console.log({ params: req.params });
  const { chunkId } = req.params;
  if (!chunkId) {
    const errMsg = 'Request is missing the required `chunkId` param.';
    log.error(`Route: download/chunkId, Error: ${errMsg}`);
    return res.status(400).json({ status: 'error', code: 400, errMsg });
  }

  log.info(`Request to fetch chunkId: ${chunkId} from S3`);

  const objInfo = await getObjectMetadata(chunkId);
  if (objInfo.ETag) {
    const fileStream = getFileStream(chunkId);
    res.attachment(chunkId);
    pipeline(fileStream, res, (err: any) => {
      if (err) {
        log.error(
          `chunkId: ${chunkId} coudn't be downloaded from S3 in download route. Error ${safeStringify(
            err
          )}`
        );
      }
      log.info(`chunkId: ${chunkId} was succesfully served by download route`);
    });
  } else {
    res.sendStatus(404);
  }
}
