
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
      reject(new Error("Google Identity Services henüz yüklenmedi veya tarayıcı kısıtlamasına takıldı."));
      return;
    }

    try {
      // Token istemci yapılandırması
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        ux_mode: 'popup', // Açılır pencere modu (Compliance hatalarını önler)
        callback: (response: any) => {
          if (response.error) {
            console.error("GSI Callback Hatası:", response);
            reject(new Error(response.error_description || response.error));
            return;
          }
          accessToken = response.access_token;
          resolve(response.access_token);
        },
        error_callback: (err: any) => {
          console.error("GSI Error Callback:", err);
          reject(new Error("Google yetkilendirme sırasında teknik bir hata oluştu."));
        }
      });
      
      // Kullanıcıdan izin iste
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error("GSI Init Hatası:", err);
      reject(err);
    }
  });
};

export const searchAuzefFiles = async (token: string, query: string = "") => {
  // Sadece PDF olan ve silinmemiş dosyaları getirir
  const q = `mimeType = 'application/pdf' and trashed = false ${query ? `and name contains '${query.replace(/'/g, "\\'")}'` : ''}`;
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, size, iconLink)&pageSize=20`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Drive araması başarısız oldu.");
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Drive Arama Hatası:", error);
    throw error;
  }
};

export const downloadDriveFile = async (token: string, fileId: string): Promise<Blob> => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!response.ok) throw new Error("Ferman indirilemedi! Erişim yetkinizi kontrol edin.");
  return await response.blob();
};

export const isDriveConfigured = () => {
  return !!accessToken;
};
