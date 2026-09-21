# Verixa-frontend

## Local development

Start Docker Desktop, then run `docker compose up -d --wait` from this directory.
Copy `backend/.env.example` to `backend/.env`, set `DB_HOST=127.0.0.1`,
`DB_PASSWORD=verixa_local`, and set a random `JWT_SECRET`.

In `backend`, run:

```sh
npm install
npm run migrate
npm run dev
```

In another terminal, in `frontend`, run:

```sh
npm install
npm run dev
```

Open http://localhost:5173. Create an organization account before signing in
to a new database. The API uses port 5001 because macOS can reserve port 5000.
Vite proxies `/api` to the backend. Remove any old `VITE_API_URL` pointing to
port 5000. For a deployed frontend, configure `VITE_API_URL` to the backend's
public `/api/v1` URL or serve `/api` through a reverse proxy.

## Gmail password reset emails

Enable Google 2-Step Verification and create an App Password:
https://support.google.com/accounts/answer/185833
Add these settings to `backend/.env` (this file is ignored by Git):

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_address@gmail.com
SMTP_PASS=your_16_character_app_password
EMAIL_FROM="Verixa <your_address@gmail.com>"
```

Use the same Gmail address for `SMTP_USER` and `EMAIL_FROM`.
In `backend`, run `npm run email:check` to verify SMTP authentication,
then restart the backend. Register the recipient email as an account first,
then use **Forgot password**. Check the inbox and spam folder for the reset link.
`PUBLIC_FRONTEND_URL` must point to the frontend that opens the reset form.
The SMTP check does not send an email.

## Certificate drafts and local issuance

Save as Draft stores one certificate form per signed-in user in this browser,
including logo and signature images. Reopening Issue Certificate restores it.
Successful issuance clears the draft. Drafts are not synced across devices.

For local issuance without Ethereum credentials, set `BLOCKCHAIN_ENABLED=false`
in `backend/.env` and restart the API. These certificates are not anchored
on the blockchain; the success dialog shows this warning. Set it to `true`
and configure the Sepolia settings for blockchain issuance.
