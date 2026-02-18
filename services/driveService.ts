
/**
 * VAKANÜVİS v3.0 - Drive Entegrasyonu
 * Müellif: Oğuz Bulut & AI Asistanı
 */

const CLIENT_ID = "809678519144-4dpd0scel97i3p0rg9msi8ie9gteav3p.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

export interface DriveFile {
  id: string;
  name: string;
  size?: string;
  modifiedTime: string;
}

let tokenClient: any = null;
let accessToken: string | null = null;

/**
 * API ve Google Identity Services'ı başlatır
 */
export const initDriveApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
      return reject(new Error("Google kütüphaneleri (gapi/gsi) yüklenemedi. İnternet bağlantınızı kontrol edin."));
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: process.env.API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // callback sonra set edilecek
        });
        
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

/**
 * Kullanıcıdan izin alır ve dosyaları listeler
 */
export const searchAuzefFiles = async (searchTerm: string = ''): Promise<DriveFile[]> => {
  const gapi = (window as any).gapi;

  // 1. Token Kontrolü ve Yetkilendirme
  if (!accessToken) {
    accessToken = await new Promise((resolve, reject) => {
      try {
        tokenClient.callback = (resp: any) => {
          if (resp.error) return reject(resp);
          resolve(resp.access_token);
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  // 2. Dosya Listeleme (Arama)
  try {
    const query = `mimeType = 'application/pdf' and trashed = false ${searchTerm ? `and name contains '${searchTerm}'` : ''}`;
    
    const response = await gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name, size, modifiedTime)',
      pageSize: 50,
      orderBy: 'name',
    });

    return response.result.files || [];
  } catch (err: any) {
    if (err.status === 401) {
      accessToken = null; // Token geçersiz, bir sonrakinde tekrar iste
      return searchAuzefFiles(searchTerm);
    }
    throw err;
  }
};

/**
 * Dosyayı indirir ve Blob olarak döndürür
 */
export const downloadDriveFile = async (fileId: string): Promise<Blob> => {
  const gapi = (window as any).gapi;
  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    
    // Gelen body'yi ArrayBuffer'a çevir
    const body = response.body;
    const n = body.length;
    const uint8Array = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      uint8Array[i] = body.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: 'application/pdf' });
  } catch (err) {
    console.error("İndirme hatası:", err);
    throw new Error("Dosya mahzenden indirilemedi.");
  }
};

export const isDriveConfigured = () => true;
export const getStoredClientId = () => CLIENT_ID;
