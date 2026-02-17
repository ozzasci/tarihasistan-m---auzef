
// Not: Gerçek bir uygulamada CLIENT_ID ve API_KEY Google Cloud Console'dan alınmalıdır.
// Burada altyapıyı ve mantığı kuruyoruz.
const CLIENT_ID = ""; // Gerekirse buraya eklenebilir
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

export const initGmailApi = (): Promise<void> => {
  return new Promise((resolve) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    gapi.load('client', async () => {
      await gapi.client.init({
        // apiKey: process.env.API_KEY, // İsteğe bağlı
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
      });

      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // On demand belirlenecek
      });
      resolve();
    });
  });
};

export const searchAuzefPdfs = async (): Promise<GmailAttachment[]> => {
  const gapi = (window as any).gapi;
  
  // 1. Yetkilendirme kontrolü veya istemi
  const token = gapi.client.getToken();
  if (!token) {
    await new Promise((resolve, reject) => {
      tokenClient.callback = (resp: any) => {
        if (resp.error !== undefined) reject(resp);
        resolve(resp);
      };
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  // 2. Mesajları ara
  const response = await gapi.client.gmail.users.messages.list({
    userId: 'me',
    q: 'auzef has:attachment filename:pdf',
    maxResults: 10
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
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';

    const parts = fullMsg.result.payload.parts || [];
    parts.forEach((part: any) => {
      if (part.filename && part.filename.toLowerCase().endsWith('.pdf')) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          messageId: msg.id,
          subject,
          date
        });
      }
    });
  }

  return attachments;
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
