// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBFGtIzVyFYkAFd2TxurBPWWSKvxa9Ackg",
    authDomain: "menu-matriarch.firebaseapp.com",
    projectId: "menu-matriarch",
    storageBucket: "menu-matriarch.appspot.com",
    messagingSenderId: "777612475421",
    appId: "1:777612475421:web:2ccd49956ce868f54a1af4",
    measurementId: "G-TH0619DG5N"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
