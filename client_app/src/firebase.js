// client_app/src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your public Firebase web config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAln9KogkLpr_eMbBLlnQfMae7Ji380phQ",
  authDomain: "avdeasis-4b5c7.firebaseapp.com",
  projectId: "avdeasis-4b5c7",
  storageBucket: "avdeasis-4b5c7.appspot.com",
  messagingSenderId: "563212793374",
  appId: "1:563212793374:web:4a5f5dd187e0304661a00f",
  measurementId: "G-5LTWLEWR22",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
