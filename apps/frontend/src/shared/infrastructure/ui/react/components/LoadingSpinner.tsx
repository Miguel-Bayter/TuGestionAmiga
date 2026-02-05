import { useTranslation } from 'react-i18next';

/**
 * Loading Spinner Component
 * Displays a centered loading spinner with internationalized text
 */
export const LoadingSpinner = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  );
};
