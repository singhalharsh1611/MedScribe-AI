export interface Language {
  code: string;
  name: string;
  nativeName: string;
  sttSupported: boolean;
  translationSupported: boolean;
  providerCode?: string; // The code expected by Sarvam AI (e.g. hi-IN)
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', sttSupported: true, translationSupported: true, providerCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', sttSupported: true, translationSupported: true, providerCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', sttSupported: true, translationSupported: true, providerCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', sttSupported: true, translationSupported: true, providerCode: 'te-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', sttSupported: true, translationSupported: true, providerCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', sttSupported: true, translationSupported: true, providerCode: 'ta-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', sttSupported: true, translationSupported: true, providerCode: 'gu-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', sttSupported: true, translationSupported: true, providerCode: 'ur-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', sttSupported: true, translationSupported: true, providerCode: 'kn-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', sttSupported: true, translationSupported: true, providerCode: 'or-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', sttSupported: true, translationSupported: true, providerCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', sttSupported: true, translationSupported: true, providerCode: 'pa-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', sttSupported: true, translationSupported: true, providerCode: 'as-IN' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', sttSupported: true, translationSupported: true, providerCode: 'mai-IN' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', sttSupported: true, translationSupported: true, providerCode: 'sa-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', sttSupported: true, translationSupported: true, providerCode: 'ne-IN' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', sttSupported: true, translationSupported: true, providerCode: 'kok-IN' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کأشُر', sttSupported: true, translationSupported: true, providerCode: 'ks-IN' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', sttSupported: true, translationSupported: true, providerCode: 'sd-IN' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', sttSupported: true, translationSupported: true, providerCode: 'doi-IN' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', sttSupported: true, translationSupported: true, providerCode: 'mni-IN' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर', sttSupported: true, translationSupported: true, providerCode: 'brx-IN' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', sttSupported: true, translationSupported: true, providerCode: 'sat-IN' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', sttSupported: false, translationSupported: true },
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', sttSupported: false, translationSupported: true },
  { code: 'hne', name: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी', sttSupported: false, translationSupported: true },
  { code: 'mag', name: 'Magahi', nativeName: 'मगही', sttSupported: false, translationSupported: true },
  { code: 'awa', name: 'Awadhi', nativeName: 'अवधी', sttSupported: false, translationSupported: true },
  { code: 'tcy', name: 'Tulu', nativeName: 'ತುಳು', sttSupported: false, translationSupported: true }
];
