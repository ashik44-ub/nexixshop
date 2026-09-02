# Google OAuth Setup Guide

আপনার e-commerce সাইটে "Continue with Google" বাটন কাজ করানোর জন্য নিচের ধাপগুলো অনুসরণ করুন।

## ধাপ ১: Google Cloud Console এ প্রজেক্ট তৈরি
1. যান: https://console.cloud.google.com/
2. উপরে বাম দিকে **Select a project → New Project**
3. প্রজেক্টের নাম দিন (যেমন: `my-ecommerce-shop`) এবং **Create** ক্লিক করুন

## ধাপ ২: OAuth Consent Screen সেটআপ
1. বাম মেনু থেকে **APIs & Services → OAuth consent screen**
2. User Type: **External** সিলেক্ট করুন → Create
3. App name, User support email, Developer contact email পূরণ করুন → Save and Continue
4. Scopes ধাপে কিছু পরিবর্তনের দরকার নেই → Save and Continue
5. Test users ধাপে (production এ যাওয়ার আগে) আপনার নিজের Gmail যোগ করুন → Save and Continue

## ধাপ ৩: OAuth Client ID তৈরি
1. বাম মেনু থেকে **APIs & Services → Credentials**
2. **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. নাম দিন (যেমন: `Shop Web Client`)
5. **Authorized JavaScript origins** এ যোগ করুন:
   - `http://localhost:3000` (ডেভেলপমেন্টের জন্য)
   - `https://yourdomain.com` (প্রোডাকশনের জন্য, পরে যোগ করবেন)
6. **Authorized redirect URIs** এ যোগ করুন (এটা সবচেয়ে গুরুত্বপূর্ণ):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (প্রোডাকশনের জন্য)
7. **Create** ক্লিক করুন

## ধাপ ৪: Client ID এবং Secret কপি করুন
তৈরি হওয়ার পর একটা পপআপে আপনি পাবেন:
- **Client ID** (এটা `xxxxxx.apps.googleusercontent.com` এরকম দেখতে)
- **Client Secret**

## ধাপ ৫: .env.local ফাইলে বসান
প্রজেক্টের রুটে `.env.local` ফাইল খুলুন (না থাকলে `.env.example` কপি করে বানান) এবং বসান:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## ধাপ ৬: সার্ভার রিস্টার্ট করুন
```bash
npm run dev
```

এখন লগইন/রেজিস্টার পেজে "Continue with Google" বাটনে ক্লিক করলে কাজ করবে।

## প্রোডাকশনে ডিপ্লয় করার সময়
- Authorized origins এবং redirect URIs এ আপনার আসল ডোমেইন যোগ করতে ভুলবেন না
- OAuth consent screen কে "Testing" থেকে "In production" এ পাবলিশ করুন (Google verification লাগতে পারে যদি sensitive scope ব্যবহার করেন — তবে শুধু email/profile scope এর জন্য সাধারণত লাগে না)
- `NEXTAUTH_URL` env variable কে আপনার প্রোডাকশন ডোমেইনে আপডেট করুন
