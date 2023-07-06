#**Tours company app**

Tech: 
  -Backend: NodeJS/Express
  -Frontend: PUG template (SSR)
  -DB: MongoDB/Mongoose
 
Implemented Stripe test payment.

run project:
```javascript
npm install
npm start
```
I have excluded .env file, so you need to add it with the following information:
  MongoDB credentials:
  - DB (MongoDB cluster url)
  - DB_PASSWORD (password for your cluster)

  Server information:
  - PORT (server port, optional, default is 8000 if not specified)
  - NODE_ENV ("development" or "production", used for different error handling)
  - JWT_SECRET (secret for json web token)
  - JWT_EXPIRATION (expiration for json web tooken i.e: 1D or 1Y)
  - JWT_COOKIE_EXPIRES (json web token browser cookie expiraton in days i.e: 5)

  SendGrid auth data:
  - EMAIL_FROM (email from which the users will get the messages)
  - SENDGRID_USERNAME (username provided by sendgrid)
  - SENDGRID_PASSWORD (password provided by sendgrid)

  Optional: (used only in "development" env for nodemailer.createTransport when SendGrid not used):
  - EMAIL_HOST 
  - EMAIL_PORT
  - EMAIL_USERNAME
  - EMAIL_PASSWORD

  Stripe payment system credentials:
  - STRIPE_SECRET (secret key provided by stripe)
  - STRIPE_WEBHOOK_SECRET (secret key provided by stripe webhooks)
  
