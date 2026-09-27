export interface Language {
  code: string;
  name: string;
  nativeName: string;
  sttSupported: boolean;
  translationSupported: boolean;
  providerCode?: string; // The code expected by ASR provider (e.g. hi-IN)
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', sttSupported: true, translationSupported: true, providerCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€', sttSupported: true, translationSupported: true, providerCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'à¦¬à¦¾à¦‚à¦²à¦¾', sttSupported: true, translationSupported: true, providerCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'à°¤à±†à°²à±à°—à±', sttSupported: true, translationSupported: true, providerCode: 'te-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'à¤®à¤°à¤¾à¤ à¥€', sttSupported: true, translationSupported: true, providerCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'à®¤à®®à®¿à®´à¯', sttSupported: true, translationSupported: true, providerCode: 'ta-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'àª—à«àªœàª°àª¾àª¤à«€', sttSupported: true, translationSupported: true, providerCode: 'gu-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'Ø§Ø±Ø¯Ùˆ', sttSupported: true, translationSupported: true, providerCode: 'ur-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'à²•à²¨à³à²¨à²¡', sttSupported: true, translationSupported: true, providerCode: 'kn-IN' },
  { code: 'or', name: 'Odia', nativeName: 'à¬“à¬¡à¬¼à¬¿à¬†', sttSupported: true, translationSupported: true, providerCode: 'or-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'à´®à´²à´¯à´¾à´³à´‚', sttSupported: true, translationSupported: true, providerCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'à¨ªà©°à¨œà¨¾à¨¬à©€', sttSupported: true, translationSupported: true, providerCode: 'pa-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'à¦…à¦¸à¦®à§€à¦¯à¦¼à¦¾', sttSupported: true, translationSupported: true, providerCode: 'as-IN' },
  { code: 'mai', name: 'Maithili', nativeName: 'à¤®à¥ˆà¤¥à¤¿à¤²à¥€', sttSupported: true, translationSupported: true, providerCode: 'mai-IN' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤®à¥', sttSupported: true, translationSupported: true, providerCode: 'sa-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€', sttSupported: true, translationSupported: true, providerCode: 'ne-IN' },
  { code: 'kok', name: 'Konkani', nativeName: 'à¤•à¥‹à¤‚à¤•à¤£à¥€', sttSupported: true, translationSupported: true, providerCode: 'kok-IN' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'Ú©Ø£Ø´ÙØ±', sttSupported: true, translationSupported: true, providerCode: 'ks-IN' },
  { code: 'sd', name: 'Sindhi', nativeName: 'Ø³Ù†ÚŒÙŠ', sttSupported: true, translationSupported: true, providerCode: 'sd-IN' },
  { code: 'doi', name: 'Dogri', nativeName: 'à¤¡à¥‹à¤—à¤°à¥€', sttSupported: true, translationSupported: true, providerCode: 'doi-IN' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'à¦®à§ˆà¦¤à§ˆà¦²à§‹à¦¨à§', sttSupported: true, translationSupported: true, providerCode: 'mni-IN' },
  { code: 'brx', name: 'Bodo', nativeName: 'à¤¬à¤°', sttSupported: true, translationSupported: true, providerCode: 'brx-IN' },
  { code: 'sat', name: 'Santali', nativeName: 'á±¥á±Ÿá±±á±›á±Ÿá±²á±¤', sttSupported: true, translationSupported: true, providerCode: 'sat-IN' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'à¤­à¥‹à¤œà¤ªà¥à¤°à¥€', sttSupported: false, translationSupported: true },
  { code: 'raj', name: 'Rajasthani', nativeName: 'à¤°à¤¾à¤œà¤¸à¥à¤¥à¤¾à¤¨à¥€', sttSupported: false, translationSupported: true },
  { code: 'hne', name: 'Chhattisgarhi', nativeName: 'à¤›à¤¤à¥à¤¤à¥€à¤¸à¤—à¤¢à¤¼à¥€', sttSupported: false, translationSupported: true },
  { code: 'mag', name: 'Magahi', nativeName: 'à¤®à¤—à¤¹à¥€', sttSupported: false, translationSupported: true },
  { code: 'awa', name: 'Awadhi', nativeName: 'à¤…à¤µà¤§à¥€', sttSupported: false, translationSupported: true },
  { code: 'tcy', name: 'Tulu', nativeName: 'à²¤à³à²³à³', sttSupported: false, translationSupported: true }
];

