/**
 * Firebase Auth ID Token verification helper (Vercel API Routes).
 *
 * Authorization: Bearer <ID_TOKEN> ヘッダから ID Token を取り出し、
 * firebase-admin/auth で検証して uid を返す。失敗時は null.
 *
 * 認可エンドポイント（cancel など）は uid を権威ある識別子として使い、
 * リクエストボディの userId を信用してはいけない（IDOR 防止）。
 */

import type { VercelRequest } from '@vercel/node';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './firebase-admin';

export async function verifyAuthUid(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return decoded.uid;
  } catch (err) {
    console.warn('[auth-verify] verifyIdToken failed', err);
    return null;
  }
}

/**
 * 本番環境判定. mock 経路や開発専用エンドポイントの本番無効化に使う.
 */
export function isProductionEnv(): boolean {
  return process.env.VERCEL_ENV === 'production';
}
