import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Lấy thông tin User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- LOGIC BẢO VỆ TRANG ADMIN ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 1. Chưa đăng nhập -> Đá về trang chủ (hoặc login)
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2. Đăng nhập rồi nhưng Email không khớp Admin -> Đá về trang chủ
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (user.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Áp dụng middleware cho mọi request TRỪ các file tĩnh, ảnh, favicon...
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}