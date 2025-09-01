import React from 'react'
import EcommerceCheckout from '../cart/page'
import AuthGuard from '@/Com/AuthGuard'

function page() {
  return (
    <AuthGuard>    <EcommerceCheckout/>  </AuthGuard>

  )
}

export default page