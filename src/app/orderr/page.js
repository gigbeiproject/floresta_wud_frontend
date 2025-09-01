import React from 'react'
import OrderPage from '../orders/page'
import AuthGuard from '@/Com/AuthGuard'

function page() {
  return (
    <AuthGuard>
   <OrderPage/>
   </AuthGuard>
  )
}

export default page
