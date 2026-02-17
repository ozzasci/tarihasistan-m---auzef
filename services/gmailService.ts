
// Oğuz, kodda bir kez tanımlarsan herkes için çalışır. 
// Tanımlamazsan kullanıcı arayüzden kendi ID'sini girebilir.
let MASTER_CLIENT_ID = ""; 

export const getStoredClientId = () => {
  return localStorage.getItem('google_client_id') || MASTER_CLIENT_ID;
};

export const setStoredClientId = (id: string) => {
  localStorage.setItem('google_client_id', id);
};

const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

export interface GmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  messageId: string;
  subject: string;
  date: string;
}

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

export const isGmailConfigured = () => getStoredClientId().length > 0;

export const initGmailApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
      console.error("Google kütüphaneleri yüklenemedi.");
      return;
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
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

export const searchAuzefPdfs = async (): Promise<GmailAttachment[]> => {
  const clientId = getStoredClientId();
  if (!clientId) throw new Error("CONFIG_MISSING");

  const gapi = (window as any).gapi;
  const google = (window as any).google;

  // Eğer tokenClient henüz oluşmadıysa (ID yeni girildiyse) oluştur
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
    const response = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: 'auzef has:attachment filename:pdf',
      maxResults: 20
    });

    const messages = response.result.messages || [];
    const attachments: GmailAttachment[] = [];

    for (const msg of messages) {
      const fullMsg = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: msg.id
      });

      const headers = fullMsg.result.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Konusuz';
      const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
      const formattedDate = new Date(dateHeader).toLocaleDateString('tr-TR');

      const parts = fullMsg.result.payload.parts || [];
      const findPdfParts = (partsList: any[]) => {
        partsList.forEach((part: any) => {
          if (part.filename && part.filename.toLowerCase().endsWith('.pdf')) {
            attachments.push({
              id: part.body.attachmentId,
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body.size,
              messageId: msg.id,
              subject,
              date: formattedDate
            });
          } else if (part.parts) {
            findPdfParts(part.parts);
          }
        });
      };
      findPdfParts(parts);
    }
    return attachments;
  } catch (err) {
    throw err;
  }
};

export const downloadAttachment = async (messageId: string, attachmentId: string): Promise<Blob> => {
  const gapi = (window as any).gapi;
  const response = await gapi.client.gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: messageId,
    id: attachmentId
  });

  const base64Data = response.result.data.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/pdf' });
};
