import { HttpError } from '../utils/http-error.js';
import { isRecord } from '../utils/validation.js';
import type { CertificateDesign } from './certificate-artifact.service.js';
export const parseCertificateDesign = (value: unknown): CertificateDesign => {
  if (value === undefined) return {};
  if (!isRecord(value)) throw new HttpError(400, 'design must be an object');
  const result: CertificateDesign = {};
  for (const key of ['recipientName', 'certificateTitle', 'organizationName', 'signerName', 'signerTitle'] as const) {
    if (value[key] !== undefined) {
      if (typeof value[key] !== 'string' || value[key].length > 200) throw new HttpError(400, `Invalid ${key}`);
      result[key] = value[key];
    }
  }
  for (const key of ['organizationLogo', 'signature'] as const) {
    if (value[key]) {
      if (typeof value[key] !== 'string' || value[key].length > 3 * 1024 * 1024 || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value[key])) throw new HttpError(400, `Invalid ${key} image`);
      result[key] = value[key];
    }
  }
  if (value.template !== undefined) {
    if (!['classic', 'modern', 'minimal'].includes(String(value.template))) throw new HttpError(400, 'Invalid template');
    result.template = value.template as CertificateDesign['template'];
  }
  if (value.accent !== undefined) {
    if (!['blue', 'violet', 'emerald'].includes(String(value.accent))) throw new HttpError(400, 'Invalid accent');
    result.accent = value.accent as CertificateDesign['accent'];
  }
  return result;
};
