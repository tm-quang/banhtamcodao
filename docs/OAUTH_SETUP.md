# Hướng dẫn Cấu hình OAuth (Google & Facebook)

## 📋 Tổng quan

Hệ thống đã được tích hợp đăng nhập bằng Google và Facebook thông qua Supabase Auth. Tài liệu này hướng dẫn cách cấu hình OAuth providers trong Supabase Dashboard.

## ⚠️ Kiểm tra Project Supabase

**TRƯỚC KHI BẮT ĐẦU:** Đảm bảo bạn đang cấu hình OAuth trong **đúng project Supabase**:

1. Mở file `.env.local` trong project
2. Tìm `NEXT_PUBLIC_SUPABASE_URL` (ví dụ: `https://zutsdzypvgticcgaatnw.supabase.co`)
3. Project reference là phần giữa: `zutsdzypvgticcgaatnw`
4. Trong Supabase Dashboard, chọn **project có reference khớp** với URL này
5. Cấu hình OAuth trong project đó

## 🔧 Các bước Cấu hình

### Bước 1: Cấu hình Google OAuth

1. **Tạo Google OAuth Credentials:**
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo project mới hoặc chọn project hiện có
   - Vào **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Chọn **Web application**
   - **QUAN TRỌNG:** Thêm **Authorized redirect URIs**:
     ```
     https://qacejkiswsemhtfhzsfd.supabase.co/auth/v1/callback
     ```
     ⚠️ **Lưu ý:** Đây phải là URL callback của Supabase (như trong hình), KHÔNG phải URL của ứng dụng Next.js. Supabase sẽ xử lý OAuth và redirect về ứng dụng của bạn sau đó.
   - Lưu **Client ID** và **Client Secret**

2. **Cấu hình trong Supabase:**
   - Đăng nhập vào [Supabase Dashboard](https://app.supabase.com/)
   - ⚠️ **QUAN TRỌNG:** Chọn **đúng project** (project reference phải khớp với `NEXT_PUBLIC_SUPABASE_URL` trong `.env.local`)
   - Vào **Authentication** > **Providers**
   - Tìm **Google** và **bật toggle** (phải chuyển sang màu xanh)
   - Nhập **Client ID** và **Client Secret** từ Google Cloud Console
   - **Lưu ý:** Copy **Callback URL** hiển thị ở đây (sẽ cần dùng cho Google Cloud Console)
   - Click **Save**
   - Đợi vài giây để cấu hình được lưu

### Bước 2: Cấu hình Facebook OAuth

⚠️ **QUAN TRỌNG:** Để tạo Facebook App cho OAuth, bạn cần vào **Facebook Developers**, KHÔNG phải **Meta Business Suite**.

**Phân biệt:**
- **Meta Business Suite**: Quản lý business tools, quảng cáo, pages (KHÔNG phải nơi tạo app)
- **Facebook Developers**: Nơi tạo và quản lý Facebook Apps cho developers (ĐÚNG nơi cần vào)

1. **Tạo Facebook App:**
   - ⚠️ **Truy cập đúng địa chỉ:** [Facebook Developers](https://developers.facebook.com/)
   - **KHÔNG** vào Meta Business Suite
   - Click **My Apps** ở góc trên bên phải
   - Click **Create App**
   
   **Cách 1: Nếu thấy màn hình chọn App Type:**
   - Trong màn hình "What do you want your app to do?", chọn **Consumer**
   - Click **Next**
   
   **Cách 2: Nếu thấy màn hình "More use cases" (như trong hình):**
   - Trong danh sách use cases, tìm và chọn: **"Authenticate and request data from users via Facebook Login"**
   - Use case này có icon Facebook 'f' và mô tả về Facebook Login
   - Click vào checkbox bên cạnh use case này
   - Click **Next** hoặc **Continue**
   
   **Điền thông tin App:**
   - **App Name**: Tên app của bạn (ví dụ: "Bánh Tằm Cô Đào")
   - **App Contact Email**: Email của bạn
   - **Business Account** (tùy chọn): Có thể bỏ qua hoặc chọn sau
   - Click **Create App**
   
   **Nếu thấy màn hình "Requirements for release":**
   - ⚠️ **QUAN TRỌNG:** Đây là màn hình yêu cầu phát hành (Business verification, Application review)
   - **Đối với development/testing:** Bạn có thể **bỏ qua** các yêu cầu này tạm thời
   - Click **Next** hoặc **Skip** để tiếp tục
   - Các yêu cầu này chỉ cần thiết khi bạn muốn phát hành app ra công chúng
   - Bạn vẫn có thể test Facebook Login trong development mode mà không cần hoàn thành các yêu cầu này
   
   **Nếu thấy màn hình "No use cases on this app" (như trong hình):**
   - ✅ **Đây là màn hình đúng!** Bạn đã tạo app thành công
   - Click nút **"+ Add use cases"** (nút màu xanh)
   - Trong danh sách use cases, tìm và chọn: **"Authenticate and request data from users via Facebook Login"**
   - Click **Next** hoặc **Continue**
   
2. **Lấy App ID và App Secret:**
   - Vào **Settings** > **Basic** trong menu bên trái (hoặc tìm "Settings" ở menu trên cùng)
   - Copy **App ID** (sẽ hiển thị ngay)
   - Để xem **App Secret**, click **Show** bên cạnh App Secret
   - ⚠️ **Lưu lại cả 2 giá trị này** - sẽ cần dùng cho Supabase
   
3. **Cấu hình Facebook Login và Redirect URI:**
   
   ⚠️ **QUAN TRỌNG:** 
   - Trong giao diện mới của Facebook Developers, cấu hình Facebook Login nằm trong **Use cases**, không phải "Products"
   - **KHÔNG** click vào link trực tiếp từ email hoặc thông báo - có thể gây lỗi "Nội dung này hiện không khả dụng"
   - Luôn truy cập qua menu bên trái trong Facebook Developers Dashboard
   
   **Các bước:**
   1. **Quay lại Facebook Developers Dashboard:**
      - Đảm bảo bạn đang ở trang chủ của app (Application Dashboard)
      - URL phải là: `https://developers.facebook.com/apps/<app-id>/dashboard/`
      - Nếu thấy lỗi "Nội dung này hiện không khả dụng", click **"Quay lại trang trước"** hoặc truy cập lại từ [My Apps](https://developers.facebook.com/apps/)
   
   2. **Click vào "Use cases" trong menu bên trái** (có icon bút chì/edit)
      - Menu bên trái sẽ hiển thị các mục: Control panel, Action to take, **Use cases**, Review, Post, Install the application, Role in the application
      - Click vào **"Use cases"** (KHÔNG phải click vào link từ email hoặc thông báo)
   
   3. **Tìm và click vào "Facebook Login":**
      - Bạn sẽ thấy danh sách các use cases đã thêm
      - Tìm và **click vào "Facebook Login"** (hoặc "Authenticate and request data from users via Facebook Login")
      - Đảm bảo click từ menu/trang chính, không phải từ link bên ngoài
   
   3a. **Nếu thấy màn hình chọn Platform (Quick Start):**
      - Facebook sẽ hỏi: "Sử dụng Quickstart để thêm Facebook Login vào ứng dụng của bạn. Để bắt đầu, hãy chọn nền tảng cho ứng dụng này."
      - ✅ **Chọn "Web"** (icon WWW màu xám)
      - Sau khi chọn Web, bạn sẽ thấy tab "Web" được highlight
      - Trong phần "1. Cho chúng tôi biết về trang web của bạn", có input field "URL trang web"
      - ⚠️ **Lưu ý:** Đây là URL của website chính của bạn (ví dụ: `https://banhtamcodao.com` hoặc `http://localhost:3300` cho development)
      - **KHÔNG** điền Supabase callback URL vào đây - đó là URL của website, không phải redirect URI
      - Bạn có thể điền URL website của bạn hoặc để trống tạm thời (có thể cấu hình sau)
      - Click **"Save"** hoặc **"Tiếp tục"** (Continue) để tiếp tục
      - ⚠️ **QUAN TRỌNG:** Redirect URI thực sự cần được cấu hình trong tab **"Cài đặt"** (Settings), không phải trong Quick Start này
   
   4. **Tìm phần Valid OAuth Redirect URIs:**
      - Trong trang cấu hình Facebook Login, bạn sẽ thấy menu bên trái với các tab:
        - **Bắt đầu nhanh** (Quick Start)
        - **Cài đặt** (Settings) ← **Click vào đây**
        - **Webhooks**
      - Click vào tab **"Cài đặt"** (Settings) trong menu bên trái
      - Cuộn xuống tìm phần **"Valid OAuth redirect URIs"** (hoặc "Valid OAuth Redirect URIs")
   
   5. **Thêm redirect URI:**
      - Trong phần **"Valid OAuth redirect URIs"**, bạn sẽ thấy một input field
      - Nếu input field đã có URL (ví dụ: `https://zutsdzypvgticcgaatnw.supabase.co/auth/v1/callback`), kiểm tra xem URL có đúng với project Supabase của bạn không
      - Nếu input field trống hoặc URL không đúng, nhập redirect URI:
        ```
        https://<your-project-ref>.supabase.co/auth/v1/callback
        ```
        (Thay `<your-project-ref>` bằng project reference của bạn, xem trong `NEXT_PUBLIC_SUPABASE_URL`)
        Ví dụ: `https://zutsdzypvgticcgaatnw.supabase.co/auth/v1/callback`
      - ⚠️ **QUAN TRỌNG:** URL phải chính xác 100%, không có dấu `/` thừa ở cuối
      - Sau khi nhập, tìm nút **"Save Changes"** hoặc **"Lưu thay đổi"** và click để lưu
      - Đợi vài giây để Facebook lưu cấu hình
   
   **Nếu gặp lỗi "Nội dung này hiện không khả dụng":**
   - ⚠️ **Nguyên nhân:** Bạn đang truy cập qua link trực tiếp hoặc link đã hết hạn
   - **Giải pháp:**
     1. Quay lại [Facebook Developers](https://developers.facebook.com/)
     2. Click **My Apps** ở góc trên bên phải
     3. Chọn app của bạn từ danh sách
     4. Từ Application Dashboard, click **"Use cases"** trong menu bên trái
     5. Click vào **"Facebook Login"** từ danh sách use cases
     6. Tiếp tục cấu hình như bước 4-5 ở trên
   
   **Nếu không thấy "Use cases" trong menu:**
   - Đảm bảo bạn đã thêm use case "Facebook Login" ở bước 1
   - Thử refresh trang (F5)
   - Kiểm tra xem app đã được tạo thành công chưa
   - Đảm bảo bạn đang ở đúng app (kiểm tra tên app ở dropdown trên cùng)
   
4. **Cấu hình App Domains (tùy chọn cho development):**
   - Vào **Settings** > **Basic**
   - **App Domains**: Có thể để trống cho development, hoặc thêm domain của bạn (ví dụ: `banhtamcodao.com`)
   - **Privacy Policy URL** và **Terms of Service URL**: Có thể để trống cho development

5. **Cấu hình trong Supabase:**
   - Trong Supabase Dashboard, vào **Authentication** > **Providers**
   - Tìm **Facebook** và **bật toggle** (phải chuyển sang màu xanh)
   - Nhập **App ID** và **App Secret** từ Facebook App (đã lưu ở bước 3)
   - **Lưu ý:** Copy **Callback URL** hiển thị ở đây (đã được thêm vào Facebook App ở bước 4)
   - Click **Save**
   - Đợi vài giây để cấu hình được lưu

### Bước 3: Kiểm tra Cấu hình

**✅ Checklist Kiểm tra:**

- [ ] Đã chọn đúng project Supabase (project reference khớp với `NEXT_PUBLIC_SUPABASE_URL`)
- [ ] Google OAuth toggle đã **BẬT** (màu xanh) trong Supabase Dashboard
- [ ] Client ID và Client Secret đã được nhập đầy đủ trong Supabase
- [ ] Đã click **Save** trong Supabase Dashboard
- [ ] Callback URL từ Supabase đã được thêm vào Google Cloud Console

1. **Kiểm tra Redirect URLs trong Google Cloud Console:**
   - ⚠️ **QUAN TRỌNG:** Trong Google Cloud Console, **Authorized redirect URIs** phải là:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     - Thay `<your-project-ref>` bằng project reference của bạn (xem trong `NEXT_PUBLIC_SUPABASE_URL`)
     - Đây là URL callback của Supabase (như hiển thị trong Supabase Dashboard)
     - **KHÔNG** phải là URL của ứng dụng Next.js
     - Supabase sẽ xử lý OAuth và tự động redirect về ứng dụng của bạn

2. **Kiểm tra Redirect URLs trong Facebook App:**
   - Tương tự, trong Facebook App Settings, **Valid OAuth Redirect URIs** phải là:
     ```
     https://qacejkiswsemhtfhzsfd.supabase.co/auth/v1/callback
     ```

3. **Test OAuth Flow:**
   - Vào trang `/login`
   - Click nút **Google** hoặc **Facebook**
   - Flow sẽ hoạt động như sau:
     1. Click button → Redirect đến Supabase OAuth endpoint
     2. Supabase redirect đến Google/Facebook
     3. User xác thực với Google/Facebook
     4. Google/Facebook redirect về Supabase callback URL
     5. Supabase xử lý và redirect về `/api/auth/callback` của ứng dụng
     6. Ứng dụng tạo session và redirect về trang chủ

## 🔐 Environment Variables

Không cần thêm environment variables mới cho OAuth. Hệ thống sử dụng:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Các credentials OAuth được lưu trữ và quản lý trong Supabase Dashboard.

## 📝 Lưu ý

1. **Customer Record:**
   - Khi user đăng nhập bằng OAuth lần đầu, hệ thống sẽ tự động tạo record trong bảng `customers`
   - Thông tin được lấy từ OAuth provider (tên, email, v.v.)
   - Role mặc định là `'customer'`

2. **Email Verification:**
   - OAuth providers đã xác thực email, nên không cần verify email riêng

3. **Development vs Production:**
   - Trong development, có thể cần cấu hình redirect URLs khác nhau
   - Đảm bảo cập nhật redirect URLs trong Google/Facebook khi deploy production

## 🐛 Troubleshooting

### Lỗi: "Unsupported provider: provider is not enabled"
- **Nguyên nhân:** OAuth provider chưa được bật trong Supabase project đang sử dụng
- **Giải pháp:**
  1. **Kiểm tra Project Supabase đúng:**
     - Xem URL trong lỗi (ví dụ: `zutsdzypvgticcgaatnw.supabase.co`)
     - So sánh với `NEXT_PUBLIC_SUPABASE_URL` trong file `.env.local`
     - Đảm bảo bạn đang cấu hình OAuth trong **đúng project Supabase**
  
  2. **Kiểm tra Provider đã được bật:**
     - Vào Supabase Dashboard
     - Chọn **đúng project** (project reference khớp với URL trong lỗi)
     - Vào **Authentication** > **Providers**
     - Tìm **Google** và đảm bảo toggle đã **BẬT** (màu xanh)
     - Kiểm tra **Client ID** và **Client Secret** đã được nhập đầy đủ
     - Click **Save** nếu có thay đổi
  
  3. **Kiểm tra Callback URL:**
     - Trong Supabase Dashboard > Authentication > Providers > Google
     - Copy **Callback URL** (ví dụ: `https://zutsdzypvgticcgaatnw.supabase.co/auth/v1/callback`)
     - Đảm bảo URL này được thêm vào Google Cloud Console > Authorized redirect URIs

### Lỗi: "redirect_uri_mismatch"
- **Nguyên nhân:** Redirect URI không khớp với cấu hình trong OAuth provider
- **Giải pháp:** 
  1. Lấy **Callback URL** từ Supabase Dashboard:
     - Vào **Authentication** > **Providers** > **Google**
     - Copy **Callback URL** (sẽ có dạng: `https://<project-ref>.supabase.co/auth/v1/callback`)
  
  2. Thêm vào Google Cloud Console:
     - Vào [Google Cloud Console](https://console.cloud.google.com/)
     - **APIs & Services** > **Credentials**
     - Tìm OAuth 2.0 Client ID của bạn
     - Click **Edit**
     - Thêm **Callback URL từ Supabase** vào **Authorized redirect URIs**
     - Click **Save**
  
  3. **QUAN TRỌNG:** 
     - URL phải **chính xác** (không có dấu `/` thừa ở cuối)
     - Phải là URL của Supabase, **KHÔNG** phải URL của ứng dụng Next.js

### Lỗi: "invalid_client"
- **Nguyên nhân:** Client ID hoặc Client Secret không đúng
- **Giải pháp:** 
  - Kiểm tra lại credentials trong Supabase Dashboard
  - Đảm bảo đã copy đầy đủ (không thiếu ký tự)
  - Thử xóa và nhập lại Client ID và Client Secret

### Lỗi: "Connection refused" hoặc không load được sau khi bấm "Tiếp tục"
- **Nguyên nhân:** 
  - Server Next.js không chạy hoặc chạy trên port khác
  - Supabase redirect về port mặc định (3000) thay vì port đang chạy (3300)
- **Giải pháp:**
  1. **Đảm bảo server đang chạy:**
     - Chạy `npm run dev` để khởi động server
     - Kiểm tra server đang chạy trên port nào (theo `package.json` là port 3300)
  
  2. **Kiểm tra URL redirect:**
     - Khi click nút OAuth, URL redirect sẽ là: `http://192.168.1.200:3300/auth/callback` (hoặc port bạn đang dùng)
     - Nếu thấy redirect về `localhost:3000`, có thể do cấu hình Supabase Site URL
  
  3. **Cấu hình Supabase Site URL (QUAN TRỌNG):**
     - Vào Supabase Dashboard > Settings > API
     - Tìm "Site URL" 
     - ⚠️ **Cập nhật thành URL của ứng dụng với đúng port:**
       - Development: `http://192.168.1.200:3300` hoặc `http://localhost:3300` (tùy vào cách bạn truy cập)
       - Production: `https://yourdomain.com`
     - **Lưu ý:** Nếu không cấu hình, Supabase có thể redirect về port mặc định (3000) thay vì port bạn đang dùng (3300)
     - Click **Save** sau khi cập nhật

### Lỗi: Không tự động chuyển về trang chủ sau khi đăng nhập
- **Nguyên nhân:**
  - Supabase redirect về port sai (3000 thay vì 3300)
  - Hash fragment không được xử lý đúng cách
  - Session không được tạo từ hash fragment
  - Callback API không được gọi thành công
- **Giải pháp:**
  1. **Cấu hình Supabase Site URL (QUAN TRỌNG):**
     - Vào Supabase Dashboard > Settings > API
     - Tìm "Site URL" và cập nhật thành URL với đúng port:
       - `http://192.168.1.200:3300` (nếu truy cập qua IP)
       - `http://localhost:3300` (nếu truy cập qua localhost)
     - Click **Save**
     - ⚠️ **Điều này rất quan trọng** để Supabase redirect về đúng port
  
  2. **Kiểm tra Browser Console:**
     - Mở F12 > Console
     - Tìm log: `OAuth redirect URL:` - phải hiển thị port 3300
     - Tìm các log: `Callback API success`, `Session error`, `Auth callback error`
     - Xem có lỗi gì không
  
  3. **Kiểm tra URL:**
     - Sau khi đăng nhập, URL phải có hash fragment: `#access_token=...`
     - URL phải có port 3300: `http://192.168.1.200:3300/auth/callback#access_token=...`
     - Nếu thấy `localhost:3000`, có nghĩa là Supabase Site URL chưa được cấu hình đúng
  
  4. **Kiểm tra Server Logs:**
     - Xem terminal nơi chạy `npm run dev`
     - Tìm log: `Creating customer record`, `Error creating customer record`
  
  5. **Thử lại:**
     - Xóa cookies và localStorage
     - Thử đăng nhập lại
     - Kiểm tra xem có redirect về trang chủ không

### Lỗi: "Ứng dụng không hoạt động" (Application is not active)
- **Nguyên nhân:** 
  - Facebook App đang ở chế độ **Development Mode** và chưa được cấu hình đúng
  - App chưa có Test Users được thêm vào
  - App chưa được chuyển sang chế độ Live (chỉ cần cho development/testing)
- **Giải pháp:**
  1. **Kiểm tra App Mode:**
     - Vào Facebook Developers Dashboard
     - Chọn app của bạn
     - Ở góc trên cùng, tìm toggle **"Development Mode"** hoặc **"Live Mode"**
     - Nếu thấy **"Development Mode"**, đây là chế độ đúng cho testing
     - ⚠️ **QUAN TRỌNG:** Trong Development Mode, chỉ có thể test với:
       - Tài khoản Facebook của bạn (người tạo app)
       - Test Users được thêm vào app
       - Roles được cấu hình trong app
   
  2. **Thêm Test Users (QUAN TRỌNG cho Development Mode):**
     - Vào Facebook Developers Dashboard > App của bạn
     - Vào **"Role in the application"** > **"Test users"** trong menu bên trái
     - Click **"Add Test Users"** hoặc **"Create Test User"**
     - Facebook sẽ tự động tạo test user hoặc bạn có thể tạo thủ công
     - ⚠️ **Lưu ý:** Bạn cần đăng nhập bằng test user này để test Facebook Login
     - Hoặc thêm tài khoản Facebook của bạn vào **"Roles"** > **"Administrators"** hoặc **"Developers"**
   
  3. **Thêm tài khoản của bạn vào Roles:**
     - Vào **"Role in the application"** > **"Roles"** trong menu bên trái
     - Tìm phần **"Administrators"** hoặc **"Developers"**
     - Click **"Add People"** hoặc **"Add"**
     - Nhập email Facebook của bạn (email dùng để đăng nhập Facebook)
     - Chọn role: **"Administrator"** hoặc **"Developer"**
     - Click **"Add"** hoặc **"Submit"**
     - ⚠️ **QUAN TRỌNG:** Bạn phải chấp nhận lời mời từ email hoặc thông báo Facebook
   
  4. **Kiểm tra App Status:**
     - Vào **Settings** > **Basic** trong menu bên trái
     - Cuộn xuống tìm phần **"App Status"**
     - Đảm bảo app không bị **"Restricted"** hoặc **"Disabled"**
     - Nếu app bị restricted, kiểm tra các yêu cầu và hoàn thành chúng
   
  5. **Kiểm tra Facebook Login Settings:**
     - Vào **Use cases** > **Facebook Login** > **Settings**
     - Đảm bảo **"Web OAuth Login"** toggle đã **BẬT** (màu xanh)
     - Kiểm tra **"Valid OAuth Redirect URIs"** đã được thêm đúng URL Supabase callback
     - Click **"Save Changes"** nếu có thay đổi
   
  6. **Thử lại:**
     - Đảm bảo bạn đã thêm tài khoản Facebook của bạn vào Roles (Administrator/Developer)
     - Hoặc sử dụng Test User để test
     - Xóa cookies và cache của browser
     - Thử đăng nhập lại bằng Facebook
   
  7. **Nếu vẫn không được (cho Production):**
     - Nếu bạn muốn app hoạt động cho tất cả người dùng, bạn cần:
       - Chuyển app sang **"Live Mode"**
       - Hoàn thành **"App Review"** và các yêu cầu phát hành
       - ⚠️ **Lưu ý:** Điều này chỉ cần thiết cho production. Với development/testing, Development Mode với Test Users là đủ

### User không được tạo trong customers table
- **Nguyên nhân:** 
  - Schema bảng `customers` thiếu cột `account_id` (UUID) hoặc `role`
  - RLS policy chặn INSERT
  - Lỗi khi insert vào database
- **Giải pháp:** 
  1. **Kiểm tra Schema:**
     - Vào Supabase Dashboard > Table Editor > `customers`
     - Đảm bảo có cột `account_id` (kiểu UUID) và `role` (kiểu TEXT)
     - Nếu thiếu, chạy migration SQL:
       ```sql
       ALTER TABLE customers ADD COLUMN IF NOT EXISTS account_id UUID;
       ALTER TABLE customers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
       ```
  
  2. **Kiểm tra RLS Policies:**
     - Vào Authentication > Policies > `customers`
     - Nếu RLS enabled, thêm policy cho phép INSERT:
       ```sql
       CREATE POLICY "Allow insert for authenticated users"
       ON customers FOR INSERT
       TO authenticated
       WITH CHECK (true);
       ```
  
  3. **Kiểm tra Logs:**
     - Xem Browser Console (F12) khi đăng nhập
     - Xem Server logs trong terminal
     - Tìm lỗi liên quan đến `account_id` hoặc `role`
  
  4. **Xem chi tiết:** Tham khảo file `docs/OAUTH_TROUBLESHOOTING.md` để biết thêm

## ⚠️ Lưu ý Quan trọng về Facebook

### Phân biệt Meta Business Suite và Facebook Developers

**Meta Business Suite** (business.facebook.com):
- Quản lý business tools, quảng cáo, pages
- **KHÔNG** phải nơi tạo Facebook App
- Nếu bạn đang ở đây, bạn đang ở sai nơi

**Facebook Developers** (developers.facebook.com):
- Nơi tạo và quản lý Facebook Apps
- **ĐÚNG nơi** để tạo app cho OAuth
- Có menu "My Apps" ở góc trên bên phải

### Cách vào đúng Facebook Developers

1. Truy cập trực tiếp: [https://developers.facebook.com/](https://developers.facebook.com/)
2. Hoặc tìm "Facebook Developers" trên Google
3. Đảm bảo URL là `developers.facebook.com`, KHÔNG phải `business.facebook.com`

## 📚 Tài liệu Tham khảo

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login)
