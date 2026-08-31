let key = "";
try {
  key = (await import("./config.local.js")).WEB3FORMS_KEY;
} catch {
  key = "";
}
export const WEB3FORMS_KEY = key;
