# Google Play — Privacy & Data Safety (Brijwasi Car Bazaar)

## Public URLs (after Vercel deploy)

- Privacy Policy: https://brijwasi-car.vercel.app/privacy-policy.html
- Terms of Service: https://brijwasi-car.vercel.app/terms-of-service.html

Paste the **Privacy Policy URL** into:

1. Google Play Console → App content → Privacy policy  
2. Google Play Console → App content → Data safety (link if asked)  
3. Store listing / app access if requested  

## Data safety form (match the live app)

| Question | Suggested answer |
|----------|------------------|
| Does your app collect or share user data? | **Yes** |
| Is all user data encrypted in transit? | **Yes** (HTTPS) |
| Do you provide a way for users to request deletion? | **Yes** (WhatsApp/email — see Privacy Policy §8) |
| Personal info — Name | Collected; App functionality |
| Personal info — Email | Collected; App functionality / Account |
| Personal info — Phone | Collected; App functionality / Account |
| Photos / videos | Collected (listing photos user uploads); App functionality |
| App info & performance / Diagnostics | May collect (Firebase/security); App functionality / Fraud prevention |
| Approximate location | **Not collected** (unless you later add it) |
| Precise location | **Not collected** |
| Financial info / Payment info | **Not collected** in-app |
| Sell user data | **No** |
| Use data for advertising / personalization ads | **No** (unless you later add ads) |

Permissions to declare: **Internet**, **Camera** (optional / photos for listings), **Photos/media** as applicable for gallery pick.

## Before submitting

1. Deploy admin/Vercel so the policy URLs return **200** (not the SPA blank page).  
2. Open both URLs in an Incognito browser.  
3. Ensure `asisodia156@gmail.com` receives mail (or update the policy email to one you monitor).  
4. Keep Data safety answers identical to the published Privacy Policy.
