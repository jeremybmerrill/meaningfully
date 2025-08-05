/* 
From https://til.simonwillison.net/electron/sign-notarize-electron-macos
Based on https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/ 
*/

// import { notarize } from "electron-notarize";

// export default async function notarizing(context) {
//   const { electronPlatformName, appOutDir } = context;
//   if (electronPlatformName !== "darwin") {
//     return;
//   }

//   const appName = context.packager.appInfo.productFilename;

//   return await notarize({
//     appBundleId: "com.jeremybmerrill.meaningfully",
//     appPath: `${appOutDir}/${appName}.app`,
//     appleId: process.env.APPLEID,
//     appleIdPassword: process.env.APPLEIDPASS,
//   });
// }

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { notarize } from "electron-notarize";

export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: 'notarytool',
    teamId: process.env.APPLETEAMID,
    appBundleId: 'com.yourcompany.yourAppId',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
};