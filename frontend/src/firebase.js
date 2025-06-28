import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCIAS78gHDY-CePE0VPOTNYa3qDiFLT_R0",
  authDomain: "coffee-chat-00.firebaseapp.com",
  projectId: "coffee-chat-00",
  storageBucket: "coffee-chat-00.appspot.com",
  messagingSenderId: "699302036015",
  appId: "1:699302036015:web:d9ea13e74c86c688bcfcda",
  measurementId: "G-BG7VHK3DJL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;


