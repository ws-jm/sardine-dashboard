import admin from "firebase-admin";
import { Datastore } from "@google-cloud/datastore";

export class FirebaseClient {
  auth: admin.auth.Auth;

  datastore: Datastore;

  constructor() {
    admin.initializeApp();
    this.auth = admin.auth();
    this.datastore = new Datastore();
  }

  verifyIdToken = async (idToken: string) => this.auth.verifyIdToken(idToken);

  userInfo = () => this.auth.listUsers();

  deleteAllUsers = (uids: string[]) => this.auth.deleteUsers(uids);

  deleteUser = (uid: string) => this.auth.deleteUser(uid);
}

export const firebaseAdmin = new FirebaseClient();
