import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '@/data/Repository'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { formatCurrency, getInitials } from '@/shared/application/helpers'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'

interface PurchaseRow {
  purchaseId: number
  title?: string
  author?: string
  purchaseDate?: string
  price?: number
}

type TabType = 'info' | 'security' | 'notifications'

export default function AccountPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const container = useContainer()
  const authService = container.cradle.authStateService as any
  const { user } = useServiceState(authService) as any
  const { success: showSuccess, error: showError } = useToast()

  const [tab, setTab] = useState<TabType>('info')
  const [panelOpen, setPanelOpen] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [purchases, setPurchases] = useState<PurchaseRow[]>([])
  const [activeLoans, setActiveLoans] = useState<number>(0)

  const [editingProfile, setEditingProfile] = useState<boolean>(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [savingProfile, setSavingProfile] = useState<boolean>(false)

  useEffect(() => {
    const uid = Number(user?.id)
    if (!Number.isFinite(uid)) return
    ;(async () => {
      try {
        await api.get(`/users/${uid}`)
        // Profile refreshed successfully
      } catch {
        // ignore
      }
    })()
  }, [user?.id])

  useEffect(() => {
    const uid = Number(user?.id)
    if (!Number.isFinite(uid)) return
    ;(async () => {
      try {
        const response = await api.get<PurchaseRow[]>(
          `/purchases?userId=${encodeURIComponent(uid)}`
        )
        setPurchases(Array.isArray(response.data) ? response.data : [])
      } catch {
        setPurchases([])
      }
    })()
  }, [user?.id])

  useEffect(() => {
    const uid = Number(user?.id)
    if (!Number.isFinite(uid)) return
    ;(async () => {
      try {
        const response = await api.get(`/loans?userId=${encodeURIComponent(uid)}`)
        const list = Array.isArray(response.data) ? response.data : []
        const active = list.filter((r) => {
          const st = String(r?.status || '').toLowerCase()
          return !st.includes('return')
        })
        setActiveLoans(active.length)
      } catch {
        setActiveLoans(0)
      }
    })()
  }, [user?.id])

  const formatPurchaseDate = (value: string | undefined): string => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const openProfileEditor = () => {
    setProfileForm({
      name: String(user?.name || ''),
      email: String(user?.email || ''),
    })
    setEditingProfile(true)
  }

  const cancelProfileEditor = () => {
    setEditingProfile(false)
    setProfileForm({ name: '', email: '' })
  }

  const onSaveProfile = async () => {
    const uid = Number(user?.id)
    if (!Number.isFinite(uid)) return

    const payload = {
      name: String(profileForm.name || '').trim(),
      email: String(profileForm.email || '').trim(),
    }

    if (!payload.name || !payload.email) {
      showError(t('account.nameEmailRequired'))
      return
    }

    setSavingProfile(true)
    try {
      const response = await api.patch(`/users/${encodeURIComponent(uid)}`, payload)

      if (response.error) {
        showError(response.error.message || t('account.couldNotUpdateProfile'))
        return
      }

      // Profile refreshed successfully

      showSuccess(t('account.profileUpdated'))
      setEditingProfile(false)
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('account.couldNotUpdateProfile'))
    } finally {
      setSavingProfile(false)
    }
  }

  const onSave = async () => {
    const uid = Number(user?.id)
    if (!Number.isFinite(uid)) return

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError(t('account.completeAllFields'))
      return
    }

    if (newPassword !== confirmPassword) {
      showError(t('account.confirmationMismatch'))
      return
    }

    try {
      const response = await api.post(`/users/${uid}/password`, {
        userId: uid,
        currentPassword: currentPassword,
        newPassword: newPassword,
      })

      if (response.error) {
        showError(response.error.message || t('account.couldNotChangePassword'))
        return
      }

      showSuccess(t('account.passwordUpdated'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPanelOpen(false)
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('account.couldNotChangePassword'))
    }
  }

  const onLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  const isAdmin = user?.roleId === 1
  const roleLabel = isAdmin ? t('user.roleAdmin') : t('user.roleUser')
  const initials = getInitials(user?.name || '')

  return (
    <div className='max-w-7xl mx-auto px-3 sm:px-0'>
      <div className='mb-4'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{t('account.myProfile')}</h1>
        <p className='text-sm text-gray-500'>{t('account.managePersonalInfo')}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start'>
        <section className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 overflow-hidden self-start'>
          <div className='p-5 sm:p-6'>
            <div className='flex flex-col items-center text-center'>
              <div className='relative'>
                <div className='h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold ring-4 ring-blue-100'>
                  {initials}
                </div>
                <div className='absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white ring-1 ring-gray-200 flex items-center justify-center text-gray-600'>
                  <svg
                    className='h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z'
                    />
                  </svg>
                </div>
              </div>

              <div className='mt-4 min-w-0'>
                <div className='text-base font-bold text-gray-900 truncate'>
                  {user?.name || 'User'}
                </div>
                <div className='text-xs text-gray-500 truncate'>{roleLabel}</div>
              </div>

              <div className='mt-5 w-full border-t border-gray-200/70 pt-4 space-y-3 text-sm'>
                <div className='flex items-center justify-between text-gray-600'>
                  <span>{t('account.activeLoans')}</span>
                  <span className='font-semibold text-rose-600'>{activeLoans}</span>
                </div>
                <div className='flex items-center justify-between text-gray-600'>
                  <span>{t('account.booksPurchased')}</span>
                  <span className='font-semibold text-emerald-600'>{purchases.length}</span>
                </div>
              </div>

              <button
                type='button'
                onClick={onLogout}
                className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
              >
                <svg
                  className='h-5 w-5'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M10 16l-4-4m0 0l4-4m-4 4h12'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M16 19a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2'
                  />
                </svg>
                {t('account.signOut')}
              </button>
            </div>
          </div>
        </section>

        <section className='space-y-4 min-w-0'>
          <div className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 p-2 sm:p-3'>
            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setTab('info')}
                className={
                  tab === 'info'
                    ? 'inline-flex items-center gap-2 rounded-xl bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200'
                    : 'inline-flex items-center gap-2 rounded-xl bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                }
              >
                <svg
                  className='h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M17 20a4 4 0 00-8 0'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
                {t('account.personalInfo')}
              </button>

              <button
                type='button'
                onClick={() => setTab('security')}
                className={
                  tab === 'security'
                    ? 'inline-flex items-center gap-2 rounded-xl bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200'
                    : 'inline-flex items-center gap-2 rounded-xl bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                }
              >
                <svg
                  className='h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 11c1.105 0 2 .895 2 2v3a2 2 0 11-4 0v-3c0-1.105.895-2 2-2z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M7 11V8a5 5 0 0110 0v3'
                  />
                </svg>
                {t('account.security')}
              </button>

              <button
                type='button'
                onClick={() => setTab('notifications')}
                className={
                  tab === 'notifications'
                    ? 'inline-flex items-center gap-2 rounded-xl bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200'
                    : 'inline-flex items-center gap-2 rounded-xl bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                }
              >
                <svg
                  className='h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 17a3 3 0 006 0'
                  />
                </svg>
                {t('account.notifications')}
              </button>
            </div>
          </div>

          {tab === 'info' && (
            <div className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 overflow-hidden'>
              <div className='flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200/70'>
                <h2 className='text-sm font-bold text-gray-900'>{t('account.personalInfo')}</h2>
                <button
                  type='button'
                  className='inline-flex items-center gap-2 text-sm font-semibold text-blue-600'
                  onClick={() => {
                    if (!editingProfile) openProfileEditor()
                  }}
                >
                  <svg
                    className='h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z'
                    />
                  </svg>
                  {t('common.edit')}
                </button>
              </div>

              <div className='p-5 space-y-4'>
                {editingProfile ? (
                  <div className='rounded-2xl bg-gray-50 ring-1 ring-gray-200/60 p-4 space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        {t('auth.fullName')}
                      </label>
                      <input
                        type='text'
                        className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((v) => ({ ...v, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        {t('auth.email')}
                      </label>
                      <input
                        type='email'
                        className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((v) => ({ ...v, email: e.target.value }))}
                      />
                    </div>

                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2'>
                      <button
                        type='button'
                        className='rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 w-full sm:w-auto'
                        onClick={cancelProfileEditor}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type='button'
                        disabled={savingProfile}
                        className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto'
                        onClick={onSaveProfile}
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className='text-xs font-semibold text-gray-500'>{t('auth.fullName')}</div>
                      <div className='mt-2 rounded-xl bg-gray-50 ring-1 ring-gray-200/60 px-3 py-2 text-sm text-gray-900'>
                        {user?.name || '-'}
                      </div>
                    </div>

                    <div>
                      <div className='text-xs font-semibold text-gray-500'>{t('auth.email')}</div>
                      <div className='mt-2 rounded-xl bg-gray-50 ring-1 ring-gray-200/60 px-3 py-2 text-sm text-gray-900'>
                        {user?.email || '-'}
                      </div>
                    </div>
                  </>
                )}

                <div className='pt-2'>
                  <div className='flex items-center justify-between gap-3'>
                    <h3 className='text-sm font-bold text-gray-900'>{t('account.booksPurchased')}</h3>
                    <span className='text-xs font-semibold text-gray-500'>{purchases.length}</span>
                  </div>

                  <div className='mt-3 rounded-2xl bg-white ring-1 ring-gray-200/60 overflow-hidden'>
                    <div className='max-h-[420px] overflow-auto overscroll-contain'>
                      <table className='w-full table-fixed divide-y divide-gray-200'>
                        <thead className='bg-gray-50 sticky top-0 z-10'>
                          <tr>
                            <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                              {t('books.book')}
                            </th>
                            <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40'>
                              {t('account.date')}
                            </th>
                            <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
                              {t('account.price')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {purchases.length === 0 ? (
                            <tr>
                              <td colSpan={3} className='px-4 sm:px-6 py-4 text-sm text-gray-500'>
                                {t('account.noPurchasesYet')}
                              </td>
                            </tr>
                          ) : (
                            purchases.map((c) => (
                              <tr key={c.purchaseId}>
                                <td className='px-4 sm:px-6 py-4 min-w-0'>
                                  <div
                                    title={String(c?.title || '-')}
                                    className='text-sm font-medium text-gray-900 truncate max-w-[420px]'
                                  >
                                    {c?.title || '-'}
                                  </div>
                                  <div
                                    title={String(c?.author || '-')}
                                    className='text-sm text-gray-500 truncate max-w-[420px]'
                                  >
                                    {c?.author || '-'}
                                  </div>
                                </td>
                                <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                  {formatPurchaseDate(c?.purchaseDate || '')}
                                </td>
                                <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                  {formatCurrency(c?.price || 0)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 overflow-hidden'>
              <div className='flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200/70'>
                <h2 className='text-sm font-bold text-gray-900'>{t('account.security')}</h2>
                <button
                  type='button'
                  className={
                    panelOpen
                      ? 'inline-flex h-9 items-center rounded-xl bg-gray-100 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-200'
                      : 'inline-flex h-9 items-center rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700'
                  }
                  onClick={() => setPanelOpen((v) => !v)}
                >
                  {panelOpen ? t('common.close') : t('account.changePassword')}
                </button>
              </div>

              <div className='p-5'>
                {panelOpen ? (
                  <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
                    <p className='text-sm text-gray-600'>
                      {t('account.securityDescription')}
                    </p>

                    <div className='mt-4 grid grid-cols-1 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          {t('account.currentPassword')}
                        </label>
                        <input
                          type='password'
                          className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          {t('account.newPassword')}
                        </label>
                        <input
                          type='password'
                          className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          {t('account.confirmNewPassword')}
                        </label>
                        <input
                          type='password'
                          className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className='mt-4 flex items-center justify-end gap-2'>
                      <button
                        type='button'
                        className='rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100'
                        onClick={() => {
                          setPanelOpen(false)
                          setCurrentPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                        }}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type='button'
                        className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
                        onClick={onSave}
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className='text-sm text-gray-500'>
                    {t('account.selectChangePassword')}
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 overflow-hidden'>
              <div className='px-5 py-4 border-b border-gray-200/70'>
                <h2 className='text-sm font-bold text-gray-900'>{t('account.notifications')}</h2>
              </div>
              <div className='p-5'>
                <div className='flex items-start rounded-2xl bg-gray-50 ring-1 ring-gray-200/60 p-4'>
                  <div className='flex items-center h-5'>
                    <input
                      id='notifications'
                      name='notifications'
                      type='checkbox'
                      defaultChecked
                      className='focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded'
                    />
                  </div>
                  <div className='ml-3 text-sm'>
                    <label htmlFor='notifications' className='font-medium text-gray-700'>
                      {t('account.receiveEmailNotifications')}
                    </label>
                    <p className='text-gray-500'>
                      {t('account.emailAvailability')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
