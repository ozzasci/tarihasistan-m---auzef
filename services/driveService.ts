
// Oğuz, Google Drive entegrasyonu için MASTER_CLIENT_ID'yi koda yazabilir 
// veya kullanıcıların arayüzden girmesini sağlayabilirsin.
let MASTER_CLIENT_ID = ""; 

export const getStoredClientId = () => {
  return localStorage.getItem('google_client_id') || MASTER_CLIENT_ID;
};

export const setStoredClientId = (id: string) => {
  localStorage.setItem('google_client_id', id);
};

// Google Drive Read-Only Scope
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
let gisInited = false;

export const isDriveConfigured = () => getStoredClientId().length > 0;

export const initDriveApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
      console.error("Google API kütüphaneleri bulunamadı.");
      return;
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
          gisInited = true;
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

  if (!tokenClient) {
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
          if (resp.error !== undefined) reject(resp);
          resolve(resp);
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err) {
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
  } catch (err) {
    console.error("Drive arama hatası:", err);
    throw err;
  }
};

export const downloadDriveFile = async (fileId: string): Promise<Blob> => {
  const gapi = (window as any).gapi;
  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    
    // GAPI media indirmelerinde response.body string veya arraybuffer dönebilir
    const body = response.body;
    const bytes = new Uint8Array(body.length);
    for (let i = 0; i < body.length; i++) {
      bytes[i] = body.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
  } catch (err) {
    console.error("Dosya indirme hatası:", err);
    throw err;
  }
};
