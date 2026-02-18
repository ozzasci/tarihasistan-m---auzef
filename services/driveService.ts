
/**
 * Oğuz'un sağladığı güncel Client ID ve kapsamlar.
 */
let MASTER_CLIENT_ID = "809678519144-4dpd0scel97i3p0rg9msi8ie9gteav3p.apps.googleusercontent.com"; 

export const getStoredClientId = () => {
  return localStorage.getItem('google_client_id') || MASTER_CLIENT_ID;
};

export const setStoredClientId = (id: string) => {
  localStorage.setItem('google_client_id', id);
};

// Kapsamları genişlettik: Hem dosya içeriği hem de meta veriler için
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

export const isDriveConfigured = () => getStoredClientId().trim().length > 0;

export const initDriveApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
      return reject(new Error("GAPI_NOT_LOADED"));
    }

    gapi.load('client', async () => {
      try {
        // Discovery Docs yüklemesi kritik
        await gapi.client.init({
          apiKey: process.env.API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        
        const clientId = getStoredClientId();
        if (clientId) {
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: '', // Arama fonksiyonunda set edilecek
          });
        }
        resolve();
      } catch (err) {
        console.error("GAPI Init Hatası:", err);
        reject(err);
      }
    });
  });
};

export const searchAuzefFiles = async (searchTerm: string = ''): Promise<DriveFile[]> => {
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
  
  // Token kontrolü ve yenileme
  const token = gapi.client.getToken();
  if (!token) {
    console.log("Vakanüvis: Yetki belgesi (token) yok, Google kapısı çalınıyor...");
    try {
      await new Promise((resolve, reject) => {
        tokenClient.callback = (resp: any) => {
          if (resp.error !== undefined) {
            console.error("Auth Yanıt Hatası:", resp);
            return reject(new Error(resp.error === 'access_denied' ? "ACCESS_DENIED" : resp.error));
          }
          resolve(resp);
        };
        // 'consent' zorunlu kılarak kutucukların işaretlenmesini sağlıyoruz
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err: any) {
      if (err.message === "ACCESS_DENIED") throw err;
      throw new Error("AUTH_FAILED");
    }
  }

  try {
    const cleanTerm = searchTerm.trim().replace(/'/g, "\\'");
    // Sorgu stratejisi: Sadece PDF'ler ve çöp kutusunda olmayanlar
    let query = `mimeType = 'application/pdf' and trashed = false`;
    if (cleanTerm) {
      query += ` and name contains '${cleanTerm}'`;
    }

    console.log("Vakanüvis Sorgusu:", query);

    const response = await gapi.client.drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, size, modifiedTime, thumbnailLink)',
      q: query,
      orderBy: 'name',
      // Paylaşılan dosyalar için kritik parametreler
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      spaces: 'drive'
    });
    
    const result = response.result.files || [];
    console.log(`Vakanüvis: ${result.length} dosya tespit edildi.`);
    return result;
  } catch (err: any) {
    console.error("Arama Teknik Hatası:", err);
    // 401 hatası token süresinin dolduğunu gösterir
    if (err.status === 401) {
      gapi.client.setToken(null);
      return searchAuzefFiles(searchTerm); // Tekrar dene (yeni token isteyecek)
    }
    throw err;
  }
};

export const downloadDriveFile = async (fileId: string): Promise<Blob> => {
  const gapi = (window as any).gapi;
  try {
    // Media download için alt=media parametresi şart
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    
    // Uint8Array dönüşümü (binary data için)
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
