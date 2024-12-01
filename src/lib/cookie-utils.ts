export const checkCookieConsent = () => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('cookie-consent') === 'accepted';
  };

export const setCookieConsent = (value: 'accepted' | 'declined') => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cookie-consent', value);
  }
};

export const removeCookieConsent = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('cookie-consent');
  }
};