
/**
 * Oğuz'un sağladığı Client ID sisteme entegre edildi.
 */
let MASTER_CLIENT_ID = "809678519144-a3d4og3opsict9836fpgff9herq3jbf1.apps.googleusercontent.com"; 

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

/**
 * Drive'da özel arama yapar.
 * @param searchTerm Kullanıcının aramak istediği kelime (varsayılan: auzef)
 */
export const searchAuzefFiles = async (searchTerm: string = 'auzef'): Promise<DriveFile[]> => {
  const clientId = getStoredClientId();
  if (!clientId) throw new Error("CONFIG_MISSING");

  const gapi = (window as any).gapi;
  const google = (window as any).google;

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
    // Arama terimini küçük harfe çevirip query oluşturuyoruz
    const query = `name contains '${searchTerm}' and mimeType = 'application/pdf' and trashed = false`;
    
    const response = await gapi.client.drive.files.list({
      pageSize: 50,
      fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink)',
      q: query,
      orderBy: 'modifiedTime desc',
      // Paylaşılan dosyaları da içermesi için:
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
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
