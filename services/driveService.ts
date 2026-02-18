
/**
 * Oğuz'un mühürlü Client ID'si. 
 * 'VAKANÜVİS' projesine aittir.
 */
const MASTER_CLIENT_ID = "809678519144-4dpd0scel97i3p0rg9msi8ie9gteav3p.apps.googleusercontent.com"; 

export const getStoredClientId = () => {
  return MASTER_CLIENT_ID;
};

// Bu fonksiyon artık MASTER_CLIENT_ID kullandığımız için sadece geriye uyumluluk adına duruyor
export const setStoredClientId = (id: string) => {
  console.log("Mühürlü ID değiştirilemez.");
};

const SCOPES = "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

let tokenClient: any = null;

export const isDriveConfigured = () => true;

export const initDriveApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
      return reject(new Error("GAPI_NOT_LOADED"));
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: process.env.API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: MASTER_CLIENT_ID,
          scope: SCOPES,
          callback: '', 
        });
        resolve();
      } catch (err) {
        console.error("GAPI Başlatma Hatası:", err);
        reject(err);
      }
    });
  });
};

export const searchAuzefFiles = async (searchTerm: string = ''): Promise<DriveFile[]> => {
  const gapi = (window as any).gapi;
  const google = (window as any).google;

  if (!tokenClient) {
    await initDriveApi();
  }
  
  const token = gapi.client.getToken();
  if (!token) {
    try {
      await new Promise((resolve, reject) => {
        tokenClient.callback = (resp: any) => {
          if (resp.error !== undefined) {
            return reject(new Error(resp.error === 'access_denied' ? "ACCESS_DENIED" : resp.error));
          }
          resolve(resp);
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err: any) {
      if (err.message === "ACCESS_DENIED") throw err;
      throw new Error("AUTH_FAILED");
    }
  }

  try {
    const cleanTerm = searchTerm.trim().replace(/'/g, "\\'");
    let query = `mimeType = 'application/pdf' and trashed = false`;
    if (cleanTerm) {
      query += ` and name contains '${cleanTerm}'`;
    }

    const response = await gapi.client.drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink)',
      q: query,
      orderBy: 'name',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      spaces: 'drive'
    });
    
    return response.result.files || [];
  } catch (err: any) {
    if (err.status === 401) {
      gapi.client.setToken(null);
      return searchAuzefFiles(searchTerm);
    }
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
