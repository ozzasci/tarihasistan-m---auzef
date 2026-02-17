
const DB_NAME = 'TarihAsistanimDB';
const STORE_PDFS = 'pdfs';
const STORE_NOTES = 'notes';
const STORE_PROGRESS = 'progress';
const STORE_USERS = 'users';
const STORE_RESOURCES = 'shared_resources';
const STORE_MESSAGES = 'messages';
const STORE_STATS = 'stats';
const STORE_VIDEO_URLS = 'video_urls'; // Yeni mahzen

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 7); // Versiyon yükseltildi
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PDFS)) db.createObjectStore(STORE_PDFS);
      if (!db.objectStoreNames.contains(STORE_NOTES)) db.createObjectStore(STORE_NOTES);
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) db.createObjectStore(STORE_PROGRESS);
      if (!db.objectStoreNames.contains(STORE_USERS)) db.createObjectStore(STORE_USERS, { keyPath: 'email' });
      if (!db.objectStoreNames.contains(STORE_RESOURCES)) db.createObjectStore(STORE_RESOURCES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_STATS)) db.createObjectStore(STORE_STATS);
      if (!db.objectStoreNames.contains(STORE_VIDEO_URLS)) db.createObjectStore(STORE_VIDEO_URLS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveCourseVideoUrl = async (courseId: string, url: string) => {
  const db = await initDB();
  return db.transaction(STORE_VIDEO_URLS, 'readwrite').objectStore(STORE_VIDEO_URLS).put(url, courseId);
};

export const getCourseVideoUrl = async (courseId: string): Promise<string | null> => {
  const db = await initDB();
  const req = db.transaction(STORE_VIDEO_URLS, 'readonly').objectStore(STORE_VIDEO_URLS).get(courseId);
  return new Promise((res) => { req.onsuccess = () => res(req.result || null); });
};

export const deleteCourseVideoUrl = async (courseId: string) => {
  const db = await initDB();
  return db.transaction(STORE_VIDEO_URLS, 'readwrite').objectStore(STORE_VIDEO_URLS).delete(courseId);
};

// ... Mevcut diğer fonksiyonlar (checkUnitExists, saveUnitPDF, getUnitPDF vb. olduğu gibi korunur)
export const checkUnitExists = async (courseId: string, unitNumber: number): Promise<boolean> => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readonly');
  const key = `${courseId}_unit_${unitNumber}`;
  const req = tx.objectStore(STORE_PDFS).get(key);
  return new Promise((res) => { req.onsuccess = () => res(!!req.result); });
};

export const saveUnitPDF = async (courseId: string, unitNumber: number, file: Blob) => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readwrite');
  const key = `${courseId}_unit_${unitNumber}`;
  return tx.objectStore(STORE_PDFS).put(file, key);
};

export const getUnitPDF = async (courseId: string, unitNumber: number): Promise<Blob | null> => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readonly');
  const key = `${courseId}_unit_${unitNumber}`;
  const req = tx.objectStore(STORE_PDFS).get(key);
  return new Promise((res) => { req.onsuccess = () => res(req.result); });
};

export const deleteUnitPDF = async (courseId: string, unitNumber: number) => {
  const db = await initDB();
  const key = `${courseId}_unit_${unitNumber}`;
  return db.transaction(STORE_PDFS, 'readwrite').objectStore(STORE_PDFS).delete(key);
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

export const deletePDF = async (courseId: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readwrite');
  return tx.objectStore(STORE_PDFS).delete(courseId);
};

export const getAllPDFs = async (): Promise<{id: string, blob: Blob}[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_PDFS, 'readonly');
  const store = tx.objectStore(STORE_PDFS);
  const req = store.getAll();
  const keysReq = store.getAllKeys();
  return new Promise((resolve) => {
    req.onsuccess = () => {
      const blobs = req.result;
      keysReq.onsuccess = () => {
        const keys = keysReq.result as string[];
        resolve(keys.map((key, i) => ({ id: key, blob: blobs[i] })));
      };
    };
  });
};

export const deleteAllPDFs = async () => {
  const db = await initDB();
  return db.transaction(STORE_PDFS, 'readwrite').objectStore(STORE_PDFS).clear();
};

export const addStudyTime = async (minutes: number) => {
  const db = await initDB();
  const tx = db.transaction(STORE_STATS, 'readwrite');
  const store = tx.objectStore(STORE_STATS);
  const req = store.get('total_study_minutes');
  return new Promise((resolve) => {
    req.onsuccess = () => {
      const current = req.result || 0;
      store.put(current + minutes, 'total_study_minutes');
      resolve(current + minutes);
    };
  });
};

export const getTotalStudyMinutes = async (): Promise<number> => {
  const db = await initDB();
  const req = db.transaction(STORE_STATS, 'readonly').objectStore(STORE_STATS).get('total_study_minutes');
  return new Promise((res) => { req.onsuccess = () => res(req.result || 0); });
};

export const registerUser = async (user: any) => {
  const db = await initDB();
  return db.transaction(STORE_USERS, 'readwrite').objectStore(STORE_USERS).add({ ...user, createdAt: Date.now() });
};

export const getAllUsers = async (): Promise<any[]> => {
  const db = await initDB();
  const req = db.transaction(STORE_USERS, 'readonly').objectStore(STORE_USERS).getAll();
  return new Promise((res) => { req.onsuccess = () => res(req.result); });
};

export const updateUser = async (user: any) => {
  const db = await initDB();
  await db.transaction(STORE_USERS, 'readwrite').objectStore(STORE_USERS).put(user);
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  const db = await initDB();
  const req = db.transaction(STORE_USERS, 'readonly').objectStore(STORE_USERS).get(email);
  return new Promise((res, rej) => {
    req.onsuccess = () => {
      const user = req.result;
      if (user && user.password === password) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        res(user);
      } else { rej("Hatalı e-posta veya şifre."); }
    };
  });
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => localStorage.removeItem('currentUser');

export const shareResource = async (resource: any) => {
  const db = await initDB();
  return db.transaction(STORE_RESOURCES, 'readwrite').objectStore(STORE_RESOURCES).add(resource);
};

export const getSharedResources = async (): Promise<any[]> => {
  const db = await initDB();
  const req = db.transaction(STORE_RESOURCES, 'readonly').objectStore(STORE_RESOURCES).getAll();
  return new Promise((res) => { req.onsuccess = () => res(req.result); });
};

export const sendMessage = async (msg: any) => {
  const db = await initDB();
  return db.transaction(STORE_MESSAGES, 'readwrite').objectStore(STORE_MESSAGES).add(msg);
};

export const getMyMessages = async (userId: string): Promise<any[]> => {
  const db = await initDB();
  const req = db.transaction(STORE_MESSAGES, 'readonly').objectStore(STORE_MESSAGES).getAll();
  return new Promise((res) => { 
    req.onsuccess = () => {
      const all = req.result;
      res(all.filter((m: any) => m.toId === userId || m.fromId === userId));
    }; 
  });
};

export const getAllPDFKeys = async (): Promise<string[]> => {
  const db = await initDB();
  const req = db.transaction(STORE_PDFS, 'readonly').objectStore(STORE_PDFS).getAllKeys();
  return new Promise((res) => { req.onsuccess = () => res(req.result as string[]); });
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
