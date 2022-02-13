import {
  EmailAuthProvider,
  getAuth,
  updateProfile,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateEmail,
  updatePassword,
  GoogleAuthProvider,
  Auth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

import devConfig from "./firebase/dev.config.json";
import prodConfig from "./firebase/prod.config.json";

const config = import.meta.env.VITE_APP_SARDINE_ENV === "production" ? prodConfig : devConfig;
window.SARDINE_ENV = import.meta.env.VITE_APP_SARDINE_ENV;

class Firebase {
  private auth: Auth;

  private googleAuthProvider: GoogleAuthProvider;

  constructor() {
    const firebaseApp = initializeApp(config);
    this.auth = getAuth(firebaseApp);
    this.googleAuthProvider = new GoogleAuthProvider();
    this.googleAuthProvider.addScope("profile");
    this.googleAuthProvider.addScope("email");
  }

  async login({ email, password }: { email: string; password: string }): Promise<string> {
    await signInWithEmailAndPassword(this.auth, email, password);
    const user = this.auth.currentUser;
    if (user === null) {
      throw new Error("Failed to login");
    }
    return user === null ? Promise.resolve("") : user.getIdToken();
  }

  logout() {
    return this.auth.signOut();
  }

  async register({ email, password, name }: { email: string; password: string; name: string }) {
    await createUserWithEmailAndPassword(this.auth, email, password);
    const user = this.auth.currentUser;
    if (user === null) {
      throw new Error("User is not logged in");
    }
    await updateProfile(user, { displayName: name });
    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user, {
      url: `${import.meta.env.VITE_APP_FRONTEND_HOST}/login?email_verified=true`,
    });
    return user.getIdToken();
  }

  isInitialized() {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(resolve);
    });
  }

  async googleLogin(): Promise<string> {
    await signInWithPopup(this.auth, this.googleAuthProvider);
    const user = this.auth.currentUser;
    if (user === null) {
      throw new Error("User is not logged in");
    }
    return user.getIdToken();
  }

  sendVerificationEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (user === null) {
      throw new Error("User is not logged in");
    }
    return sendEmailVerification(user);
  }

  validatePassword(email: string, password: string) {
    const user = this.auth.currentUser;
    if (user === null) {
      throw new Error("User is not logged in");
    }
    const credential = EmailAuthProvider.credential(email, password);
    return reauthenticateWithCredential(user, credential);
  }

  updatePassword(password: string) {
    if (this.auth.currentUser === null) {
      throw new Error("User is not logged in");
    }
    return updatePassword(this.auth.currentUser, password);
  }

  async updateEmail(email: string) {
    const user = this.auth.currentUser;
    if (user === null || this.auth.currentUser === null) {
      throw new Error("User is not logged in");
    }
    await updateEmail(user, email);
    await sendEmailVerification(this.auth.currentUser);
  }
}

export default new Firebase();
