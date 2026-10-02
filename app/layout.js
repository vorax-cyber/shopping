import './globals.css'

export const metadata = {
  title: 'المتجر الإلكتروني',
  description: 'متجر إلكتروني متكامل للبيع والتوصيل',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  )
}
