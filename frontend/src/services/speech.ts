export const speakText = (text: string) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/^"|"$/g, ''));
  utterance.lang = 'en-US';
  utterance.rate = 0.96;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
