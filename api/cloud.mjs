import { createCloudHandler } from '../server/cloud-core.mjs';

let handler;
export default function cloud(req, res) {
  handler ||= createCloudHandler(process.env);
  return handler(req, res);
}
