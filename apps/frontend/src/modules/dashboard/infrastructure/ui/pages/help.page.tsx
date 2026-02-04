export default function HelpPage() {
  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='text-2xl font-extrabold tracking-tight text-gray-900'>Help</h2>
        <p className='mt-2 text-sm text-gray-600'>
          Here you will find a quick guide to using the system and testing the main features.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>How to sign in</h3>
          <p className='mt-2 text-sm text-gray-700'>
            If you don't have an account, use the <span className='font-semibold'>Register</span> option.
            Then sign in with your email and password.
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>
            How to view available books (Rentable)
          </h3>
          <p className='mt-2 text-sm text-gray-700'>
            On the <span className='font-semibold'>Home</span> page, you can use the{' '}
            <span className='font-semibold'>Rentable</span> tab (next to{' '}
            <span className='font-semibold'>Buy</span>) to filter books that are
            available.
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>How to rent a book</h3>
          <p className='mt-2 text-sm text-gray-700'>
            On a book card, click <span className='font-semibold'>Rent</span>. Then
            check the <span className='font-semibold'>Loans</span> section to view the record
            and use the <span className='font-semibold'>Return</span> option.
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='text-lg font-bold text-gray-900'>How to buy a book</h3>
          <p className='mt-2 text-sm text-gray-700'>
            On a book card, click <span className='font-semibold'>Buy</span> to
            add it to the <span className='font-semibold'>Cart</span>. Then go to{' '}
            <span className='font-semibold'>Cart</span> and confirm with{' '}
            <span className='font-semibold'>Buy</span> (checkout).
          </p>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='text-lg font-bold text-gray-900'>If no books appear</h3>
        <p className='mt-2 text-sm text-gray-700'>
          Load sample data in MySQL using{' '}
          <span className='font-mono'>backend/sql/seed_demo_data.sql</span> and reload the page.
        </p>
      </div>
    </div>
  )
}
