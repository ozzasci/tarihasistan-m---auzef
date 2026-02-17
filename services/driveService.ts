
/**
 * Oğuz, Google Cloud Console'dan aldığın Client ID'yi aşağıdaki tırnakların içine yazarsan
 * uygulama herkes için otomatik olarak çalışır.
 * Boş bırakırsan kullanıcıların kendi ID'lerini girmeleri gerekir.
 */
let MASTER_CLIENT_ID = ""; 

export const getStoredClientId = () => {
  return localStorage.getItem('google_client_id') || MASTER_CLIENT_ID;
};

export const setStoredClientId = (id: string) => {
  localStorage.setItem('google_client_id', id);
};

const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

let tokenClient: any = null;
let gapiInited = false;

export const isDriveConfigured = () => getStoredClientId().trim().length > 0;

export const initDriveApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
      return reject(new Error("Google kütüphaneleri yüklenemedi."));
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiInited = true;
        
        const clientId = getStoredClientId();
        if (clientId) {
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: '', 
          });
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const searchAuzefFiles = async (): Promise<DriveFile[]> => {
  const clientId = getStoredClientId();
  if (!clientId) throw new Error("CONFIG_MISSING");

  const gapi = (window as any).gapi;
  const google = (window as any).google;

  // Re-init tokenClient if ID changed or not set
  if (!tokenClient || tokenClient.client_id !== clientId) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: '', 
    });
  }
  
  const token = gapi.client.getToken();
  if (!token) {
    try {
      await new Promise((resolve, reject) => {
        tokenClient.callback = (resp: any) => {
          if (resp.error !== undefined) {
            // Eğer Google "invalid_client" dönerse bunu yakala
            if (resp.error === 'invalid_client') reject(new Error("INVALID_CLIENT"));
            reject(resp);
          }
          resolve(resp);
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err: any) {
      if (err.message === "INVALID_CLIENT") throw err;
      throw new Error("AUTH_CANCELED");
    }
  }

  try {
    const response = await gapi.client.drive.files.list({
      pageSize: 30,
      fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink)',
      q: "name contains 'auzef' and mimeType = 'application/pdf' and trashed = false",
      orderBy: 'modifiedTime desc'
    });

    return response.result.files || [];
  } catch (err: any) {
    if (err.status === 401) throw new Error("INVALID_CLIENT");
    throw err;
  }
};

export const downloadDriveFile = async (fileId: string): Promise<Blob> => {
  const gapi = (window as any).gapi;
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  });
  
  const body = response.body;
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) {
    bytes[i] = body.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/pdf' });
};
