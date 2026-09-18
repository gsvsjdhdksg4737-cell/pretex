import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, getDocs, query, orderBy } from "firebase/firestore";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

export { onAuthStateChanged };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const auth = getAuth(app);

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  accountCode: string;
  subscriptionPlan: "مجاني" | "منشئ ألعاب" | "برو";
  createdAt: string;
  lastLoginAt: string;
}

export interface UserProject {
  id: string;
  userId: string;
  accountCode: string;
  title: string;
  htmlCode: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedApp {
  id: string;
  title: string;
  htmlCode: string;
  prompt: string;
  engine: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  renewalCount: number;
  creatorName?: string;
  creatorUid?: string;
  accountCode?: string;
}

// Google Sign-In & Profile Sync
export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  // Retrieve or create User Profile with Unique Account Code
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const existing = snap.data() as UserProfile;
    await updateDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
      displayName: user.displayName || existing.displayName || "مستخدم بريتكس 360",
      photoURL: user.photoURL || existing.photoURL || "",
    });
    return {
      ...existing,
      lastLoginAt: new Date().toISOString(),
    };
  } else {
    // Generate unique account code for user (e.g. PRT-583921)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const accountCode = `PRT-${randomDigits}`;
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || "مطور بريتكس 360",
      email: user.email || "",
      photoURL: user.photoURL || "",
      accountCode,
      subscriptionPlan: "مجاني",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// Save Project to User's Cloud Account
export async function saveUserProject(userId: string, accountCode: string, title: string, htmlCode: string, prompt: string): Promise<string> {
  const projectId = "proj_" + Math.random().toString(36).substring(2, 10);
  const now = new Date().toISOString();
  const project: UserProject = {
    id: projectId,
    userId,
    accountCode,
    title: title || "مشروع 3D جديد",
    htmlCode,
    prompt: prompt || "",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, "users", userId, "projects", projectId), project);
  return projectId;
}

// Fetch user's saved projects
export async function getUserProjects(userId: string): Promise<UserProject[]> {
  const projectsRef = collection(db, "users", userId, "projects");
  const q = query(projectsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserProject);
}

// Publish App to Public Gallery
export async function publishAppToFirebase(data: {
  title: string;
  htmlCode: string;
  prompt: string;
  engine: string;
  creatorName?: string;
  creatorUid?: string;
  accountCode?: string;
}): Promise<string> {
  const appId = "app_" + Math.random().toString(36).substring(2, 10);
  const now = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days validity

  const appDoc: PublishedApp = {
    id: appId,
    title: data.title || "تطبيق / لعبة ويب متقدمة",
    htmlCode: data.htmlCode,
    prompt: data.prompt || "",
    engine: data.engine || "Three.js / 3D Realistic",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    renewalCount: 0,
    creatorName: data.creatorName || "مطور روني ستيكس",
    creatorUid: data.creatorUid || "",
    accountCode: data.accountCode || "",
  };

  await setDoc(doc(db, "published_apps", appId), appDoc);
  return appId;
}

export async function getPublishedApp(appId: string): Promise<PublishedApp | null> {
  const docRef = doc(db, "published_apps", appId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as PublishedApp;
}

export async function renewAppMonthly(appId: string): Promise<{ newExpiresAt: string; renewalCount: number }> {
  const docRef = doc(db, "published_apps", appId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("التطبيق غير موجود في Firebase");

  const current = snap.data() as PublishedApp;
  const now = new Date();
  const newExpires = new Date();
  newExpires.setDate(newExpires.getDate() + 30);

  const updatedRenewalCount = (current.renewalCount || 0) + 1;

  await updateDoc(docRef, {
    updatedAt: now.toISOString(),
    expiresAt: newExpires.toISOString(),
    renewalCount: updatedRenewalCount,
  });

  return {
    newExpiresAt: newExpires.toISOString(),
    renewalCount: updatedRenewalCount,
  };
}

// Subscription Requests and Admin System
export interface SubscriptionRequest {
  id: string;
  email: string;
  displayName?: string;
  cashNumber: string;
  whatsappNumber: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  screenshotUrl?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface ApprovedEmail {
  email: string;
  approvedAt: string;
  approvedBy: string;
  active: boolean;
}

export const ADMIN_EMAIL = "al6332047@gmail.com";

export interface AdminSettings {
  cashNumber: string;
  whatsappNumber: string;
  priceUsd: number;
  updatedAt?: string;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  cashNumber: "01036243875", // K: Vodafone Cash number specified by user
  whatsappNumber: "01559735253", // W: WhatsApp number specified by user
  priceUsd: 20,
};

// Create a new subscription payment request
export async function createSubscriptionRequest(data: {
  email: string;
  displayName?: string;
  cashNumber: string;
  whatsappNumber: string;
  amount?: number;
  notes?: string;
  screenshotUrl?: string;
}): Promise<string> {
  const requestId = "sub_" + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  
  const subDoc: SubscriptionRequest = {
    id: requestId,
    email: data.email.trim().toLowerCase(),
    displayName: data.displayName || "مستخدم بريتكس 360",
    cashNumber: data.cashNumber.trim(),
    whatsappNumber: data.whatsappNumber.trim() || DEFAULT_ADMIN_SETTINGS.whatsappNumber,
    amount: data.amount || 20,
    status: "pending",
    notes: data.notes || "",
    screenshotUrl: data.screenshotUrl || "",
    createdAt: now,
  };

  await setDoc(doc(db, "subscriptions", requestId), subDoc);
  return requestId;
}

// Fetch all subscription requests for Admin
export async function getAllSubscriptionRequests(): Promise<SubscriptionRequest[]> {
  const colRef = collection(db, "subscriptions");
  const snap = await getDocs(colRef);
  const list: SubscriptionRequest[] = [];
  snap.forEach((d) => {
    list.push(d.data() as SubscriptionRequest);
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Approve subscription request: marks request approved AND adds email to approved_emails
export async function approveSubscriptionRequest(requestId: string, userEmail: string, adminEmail: string): Promise<void> {
  const reqRef = doc(db, "subscriptions", requestId);
  const now = new Date().toISOString();
  await updateDoc(reqRef, {
    status: "approved",
    approvedAt: now,
  });

  // Also add to approved_emails collection
  const normalizedEmail = userEmail.trim().toLowerCase();
  const safeDocId = encodeURIComponent(normalizedEmail);
  await setDoc(doc(db, "approved_emails", safeDocId), {
    email: normalizedEmail,
    approvedAt: now,
    approvedBy: adminEmail || "al6332047@gmail.com",
    active: true,
  });
}

// Reject subscription request
export async function rejectSubscriptionRequest(requestId: string): Promise<void> {
  const reqRef = doc(db, "subscriptions", requestId);
  await updateDoc(reqRef, {
    status: "rejected",
  });
}

// Check if a specific email is approved for VIP
export async function checkEmailIsApproved(email: string): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  // Admin email is always VIP approved
  if (normalizedEmail === "al6332047@gmail.com") return true;

  try {
    const safeDocId = encodeURIComponent(normalizedEmail);
    const snap = await getDoc(doc(db, "approved_emails", safeDocId));
    if (snap.exists()) {
      const data = snap.data() as ApprovedEmail;
      return data.active === true;
    }
  } catch (err) {
    console.error("Error checking approved email:", err);
  }
  return false;
}

// Fetch all approved emails for Admin
export async function getAllApprovedEmails(): Promise<ApprovedEmail[]> {
  const colRef = collection(db, "approved_emails");
  const snap = await getDocs(colRef);
  const list: ApprovedEmail[] = [];
  snap.forEach((d) => {
    list.push(d.data() as ApprovedEmail);
  });
  return list;
}

// Manually add an approved email from Admin Dashboard
export async function manuallyApproveEmail(email: string, adminEmail: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const safeDocId = encodeURIComponent(normalizedEmail);
  const now = new Date().toISOString();
  await setDoc(doc(db, "approved_emails", safeDocId), {
    email: normalizedEmail,
    approvedAt: now,
    approvedBy: adminEmail || "al6332047@gmail.com",
    active: true,
  });
}

// Remove or revoke an approved email
export async function revokeApprovedEmail(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const safeDocId = encodeURIComponent(normalizedEmail);
  await setDoc(doc(db, "approved_emails", safeDocId), {
    email: normalizedEmail,
    active: false,
    revokedAt: new Date().toISOString(),
  }, { merge: true });
}

// Admin Settings (Cash number, WhatsApp number, Price)
export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const snap = await getDoc(doc(db, "admin_settings", "general"));
    if (snap.exists()) {
      return { ...DEFAULT_ADMIN_SETTINGS, ...(snap.data() as AdminSettings) };
    }
  } catch (e) {
    console.error("Error reading admin settings:", e);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  await setDoc(doc(db, "admin_settings", "general"), {
    ...settings,
    updatedAt: new Date().toISOString(),
  });
}
