
/**
 * DRIVE SERVISI - AKADEMIK EDITION
 * Google Drive üzerinden ferman (PDF) ithalatı için tasarlandı.
 */

let accessToken: string | null = null;
let gisLoaded = false;

export const initDriveApi = async (clientId: string): Promise<boolean> => {
  if (gisLoaded) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const getDriveAccessToken = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google || !google.accounts || !google.accounts.oauth2) {
      reject(new Error("Google Identity Services henüz yüklenmedi veya kısıtlanmış."));
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          accessToken = response.access_token;
          resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

export const searchAuzefFiles = async (token: string, query: string = "") => {
  const q = `mimeType = 'application/pdf' and trashed = false ${query ? `and name contains '${query.replace(/'/g, "\\'")}'` : ''}`;
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, size, iconLink)`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!response.ok) throw new Error("Drive araması başarısız oldu.");
  const data = await response.json();
  return data.files || [];
};

export const downloadDriveFile = async (token: string, fileId: string): Promise<Blob> => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!response.ok) throw new Error("Ferman indirilemedi!");
  return await response.blob();
};

export const isDriveConfigured = () => {
  return !!accessToken;
};
