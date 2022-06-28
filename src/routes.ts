import { getFileFromS3, health, isUploaded } from "./handlers";

export default (_, router) => {
    router.get('/health', health);
    router.get('/download/:chunkId', getFileFromS3);
    router.get('/is_uploaded/:chunkId', isUploaded);
};
