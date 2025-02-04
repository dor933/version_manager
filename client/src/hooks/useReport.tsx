import { useAuth } from '../UseContext/MainAuth';

export const useReport = () => {
  const { 
    setIsPopupOpen, 
    setTitle, 
    setMainMessage, 
    setButtonText, 
    setIssucceeded 
  } = useAuth();

  const showError = (message: string) => {
    setIsPopupOpen(true);
    setTitle('Error');
    setMainMessage(message);
    setButtonText('OK');
  };

  const showSuccess = (message: string) => {
    setIsPopupOpen(true);
    setTitle('Success');
    setIssucceeded(true);
    setMainMessage(message);
    setButtonText('OK');
  };

  return {
    showError,
    showSuccess
  };
}; 