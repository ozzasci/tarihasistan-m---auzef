
const DB_NAME = 'TarihAsistanimDB';
const STORE_PDFS = 'pdfs';
const STORE_NOTES = 'notes';
const STORE_PROGRESS = 'progress';
const STORE_USERS = 'users';
const STORE_RESOURCES = 'shared_resources';
const STORE_MESSAGES = 'messages';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4); // Versiyon yükseltildi
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PDFS)) db.createObjectStore(STORE_PDFS);
      if (!db.objectStoreNames.contains(STORE_NOTES)) db.createObjectStore(STORE_NOTES);
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) db.createObjectStore(STORE_PROGRESS);
      if (!db.objectStoreNames.contains(STORE_USERS)) db.createObjectStore(STORE_USERS, { keyPath: 'email' });
      if (!db.objectStoreNames.contains(STORE_RESOURCES)) db.createObjectStore(STORE_RESOURCES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const registerUser = async (user: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_USERS, 'readwrite');
  return tx.objectStore(STORE_USERS).add({ ...user, createdAt: Date.now() });
};

export const getAllUsers = async (): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_USERS, 'readonly');
  const req = tx.objectStore(STORE_USERS).getAll();
  return new Promise((res) => { req.onsuccess = () => res(req.result); });
};

export const updateUser = async (user: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_USERS, 'readwrite');
  await tx.objectStore(STORE_USERS).put(user);
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  const db = await initDB();
  const tx = db.transaction(STORE_USERS, 'readonly');
  const req = tx.objectStore(STORE_USERS).get(email);
  return new Promise((res, rej) => {
    req.onsuccess = () => {
      const user = req.result;
      if (user && user.password === password) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        res(user);
      } else {
        rej("Hatalı e-posta veya şifre.");
      }
    };
  });
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

// Kaynak Paylaşımı
export const shareResource = async (resource: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_RESOURCES, 'readwrite');
  return tx.objectStore(STORE_RESOURCES).add(resource);
};

export const getSharedResources = async (): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_RESOURCES, 'readonly');
  const req = tx.objectStore(STORE_RESOURCES).getAll();
  return new Promise((res) => { req.onsuccess = () => res(req.result); });
};

// Mesajlaşma
export const sendMessage = async (msg: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_MESSAGES, 'readwrite');
  return tx.objectStore(STORE_MESSAGES).add(msg);
};

export const getMyMessages = async (userId: string): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_MESSAGES, 'readonly');
  const req = tx.objectStore(STORE_MESSAGES).getAll();
  return new Promise((res) => { 
    req.onsuccess = () => {
      const all = req.result;
      res(all.filter((m: any) => m.toId === userId || m.fromId === userId));
    }; 
  });
};

export const savePDF = async (courseId: string, file: Blob) => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readwrite');
  return tx.objectStore(STORE_PDFS).put(file, courseId);
};

export const getPDF = async (courseId: string): Promise<Blob | null> => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readonly');
  const req = tx.objectStore(STORE_PDFS).get(courseId);
  return new Promise((res) => { req.onsuccess = () => res(req.result); });
};

export const getAllPDFs = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readonly');
  const req = tx.objectStore(STORE_PDFS).getAllKeys();
  const keys = await new Promise<string[]>((res) => { req.onsuccess = () => res(req.result as string[]); });
  const results = [];
  for (const key of keys) {
    const blobReq = tx.objectStore(STORE_PDFS).get(key);
    const blob = await new Promise<Blob>((res) => { blobReq.onsuccess = () => res(blobReq.result); });
    results.push({ id: key, blob });
  }
  return results;
};

export const deletePDF = async (courseId: string) => {
  const db = await initDB();
  return db.transaction(STORE_PDFS, 'readwrite').objectStore(STORE_PDFS).delete(courseId);
};

export const saveNote = async (courseId: string, content: string) => {
  const db = await initDB();
  return db.transaction(STORE_NOTES, 'readwrite').objectStore(STORE_NOTES).put(content, courseId);
};

export const getNote = async (courseId: string): Promise<string> => {
  const db = await initDB();
  const req = db.transaction(STORE_NOTES, 'readonly').objectStore(STORE_NOTES).get(courseId);
  return new Promise((res) => { req.onsuccess = () => res(req.result || ""); });
};

export const saveProgress = async (courseId: string, progress: number) => {
  const db = await initDB();
  return db.transaction(STORE_PROGRESS, 'readwrite').objectStore(STORE_PROGRESS).put(progress, courseId);
};

export const getProgress = async (courseId: string): Promise<number> => {
  const db = await initDB();
  const req = db.transaction(STORE_PROGRESS, 'readonly').objectStore(STORE_PROGRESS).get(courseId);
  return new Promise((res) => { req.onsuccess = () => res(req.result || 0); });
};
