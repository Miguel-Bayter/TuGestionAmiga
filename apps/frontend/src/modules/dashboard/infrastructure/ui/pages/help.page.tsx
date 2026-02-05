import { useTranslation } from 'react-i18next'

export default function HelpPage() {
  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='text-2xl font-extrabold tracking-tight text-gray-900'>{t('help.title')}</h2>
        <p className='mt-2 text-sm text-gray-600'>
          {t('help.description')}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>{t('help.howToSignIn')}</h3>
          <p className='mt-2 text-sm text-gray-700'>
            {t('help.signInDescription')}
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>
            {t('help.howToViewRentable')}
          </h3>
          <p className='mt-2 text-sm text-gray-700'>
            {t('help.viewRentableDescription')}
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>{t('help.howToRentBook')}</h3>
          <p className='mt-2 text-sm text-gray-700'>
            {t('help.rentBookDescription')}
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>{t('help.howToBuyBook')}</h3>
          <p className='mt-2 text-sm text-gray-700'>
            {t('help.buyBookDescription')}
          </p>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='text-lg font-bold text-gray-900'>{t('help.noBooksAppear')}</h3>
        <p className='mt-2 text-sm text-gray-700'>
          {t('help.noBooksDescription')}
        </p>
      </div>
    </div>
  )
}
