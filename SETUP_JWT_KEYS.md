# JWT Keys Setup Instructions

The JWT keys have been generated. You need to set them as environment variables in your Convex deployment.

## Option 1: Using Convex CLI (Recommended)

Run these commands in your terminal:

```bash
npx convex env set JWT_PRIVATE_KEY "-----BEGIN PRIVATE KEY----- MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDD8oG5ybJWjDUK X7wJuchUrwca1duF2jA0wjmFA5B0mMH5zBK9H3+VEzZl+mU2AyAebGZXj0zRwO/P yTNJsmwC/4qZZ397rS+P55wsGSqOnTWH5x4Qn7vHxb5wbKBoSDZaU1n+adryYJws UmwqzeOc2cv/IDCfuzJKrtwU0g25PStJEpBAymXuoPlXHL+cdlj5TDsE2koXpD07 Mr/1kMvweVcnOdIy/U4GRErJqj8XZXRsnCm+9Hj2bQ4CUI2t2BaY+hb2r//m0VEE v3zmq9pY8nV8Fqb884RsHEYbFiBVylAhN53Je11f56wLps85vPJj8JFcLukjGaZy 1fM6H3U5AgMBAAECggEAFNDEOypUCaGnWMzGuvnDcEuPo6goQ9Xj3Rbs6VZxmBFK OfEV5IVeFkYON1McQVqfpNu7G34bmQS39QjYq/GKS989qAI4prjFHrJqAr1BqhjF QQSqSvXNCvHUwzim6a0SKRJFsyMnoSvmK0cuOnXYwibY5udSgwVt2EUvF/8gehb3 01nnQ2SZqmnohwwfC/BcHnd3KLx0D9kU1v2xCJwuOHGKHLxF3S4eeFnzLvAUJQJF wk3u89MtLnceP+s3PYUjAeBXMA2HS2KVnyW5NL9lWZHHdyFSmRIccDmkThk6zol8 jvKsJ5WbR3kOmr+tc+KAp8kuMFc6Mr7Qpo6rIFsUAQKBgQDk+qMTI7tLXKKWmUGN +tixDaWnDDUHofN1gZsekhpqGSypr5MzJKkW/2gY1gSZWZtl89TcP4ozKX0BlNvD khFVbNrTKqJNPOQ0OEgixWpihkaS1CRdzYIjn/3n6XVIFxbVrrAy56d+p8LWzYLP 9NpFKtukXMp3L9bZ541x7LUowQKBgQDbEf5uk/tIM+AgE82Vyx2LIpoW8TtnOD2p WXQI/4wxkw+w1xgl88fo1ZJNbID70bQvsQyuJBI0ravZRxY+yvCUpGMtuFFhcJFe VaVzMMBAQ16zoRP6aEPM0Xv3r4ypL8Lhwg5mdc2WUG/qpo9cdocroZdRGyOifTBJ 4gOua2myeQKBgQCgBEOIMZVG0iLRSaKVPPLHsHjOJ2q7vcKsoHktwP5ynMsofglJ WVpNNwmhKZcnL4a4ldBwZnsGy/yO6V826dHxN9QodAfeICp+D8LhgcKZvap+G4Ca iO5kRP+kXPLYAUK065I40Mita0Fu6Ul8WGlcotnBoBLhfe4Qc4/WSIxFQQKBgHJA 3DXHsBJkG8wfB+XL3Uinbz3v6k9XIbGlGcNnpDJmxJQyWkHQ9r4URQ1kPZEYOaV1 7WsVHPmkajATxyJQrVCYu7EopCjxkJ9mg7ekAWCCwm1k4QqEPngf+UugnvfOFRGx J9mALwzqPrRe0f4jQzQaPtTqFpe0Ou8NlWXuV13hAoGBAJenHkdMfdigZljBQhGH gjuR/8RdZ8G2lN9wm8F6C9JJqfgMnh9KyF+w4wqI+LdItHGWdeBnY1vJqXvnIgsn CosHQw28Ot+jjULZkA2ZiCks5TeEa2h9er5NoWW0Ug/ApWTz2/SdvU/EkmSMIoX/ ylDl4wP1uKBWxn+niZDkWc6l -----END PRIVATE KEY-----"

npx convex env set JWKS '{"keys":[{"use":"sig","kty":"RSA","n":"w_KBucmyVow1Cl-8CbnIVK8HGtXbhdowNMI5hQOQdJjB-cwSvR9_lRM2ZfplNgMgHmxmV49M0cDvz8kzSbJsAv-KmWd_e60vj-ecLBkqjp01h-ceEJ-7x8W-cGygaEg2WlNZ_mna8mCcLFJsKs3jnNnL_yAwn7sySq7cFNINuT0rSRKQQMpl7qD5Vxy_nHZY-Uw7BNpKF6Q9OzK_9ZDL8HlXJznSMv1OBkRKyao_F2V0bJwpvvR49m0OAlCNrdgWmPoW9q__5tFRBL985qvaWPJ1fBam_POEbBxGGxYgVcpQITedyXtdX-esC6bPObzyY_CRXC7pIxmmctXzOh91OQ","e":"AQAB"}]}'
```

## Option 2: Using Convex Dashboard

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add the following variables:

   **Variable Name:** `JWT_PRIVATE_KEY`  
   **Value:** 
   ```
   -----BEGIN PRIVATE KEY----- MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDD8oG5ybJWjDUK X7wJuchUrwca1duF2jA0wjmFA5B0mMH5zBK9H3+VEzZl+mU2AyAebGZXj0zRwO/P yTNJsmwC/4qZZ397rS+P55wsGSqOnTWH5x4Qn7vHxb5wbKBoSDZaU1n+adryYJws UmwqzeOc2cv/IDCfuzJKrtwU0g25PStJEpBAymXuoPlXHL+cdlj5TDsE2koXpD07 Mr/1kMvweVcnOdIy/U4GRErJqj8XZXRsnCm+9Hj2bQ4CUI2t2BaY+hb2r//m0VEE v3zmq9pY8nV8Fqb884RsHEYbFiBVylAhN53Je11f56wLps85vPJj8JFcLukjGaZy 1fM6H3U5AgMBAAECggEAFNDEOypUCaGnWMzGuvnDcEuPo6goQ9Xj3Rbs6VZxmBFK OfEV5IVeFkYON1McQVqfpNu7G34bmQS39QjYq/GKS989qAI4prjFHrJqAr1BqhjF QQSqSvXNCvHUwzim6a0SKRJFsyMnoSvmK0cuOnXYwibY5udSgwVt2EUvF/8gehb3 01nnQ2SZqmnohwwfC/BcHnd3KLx0D9kU1v2xCJwuOHGKHLxF3S4eeFnzLvAUJQJF wk3u89MtLnceP+s3PYUjAeBXMA2HS2KVnyW5NL9lWZHHdyFSmRIccDmkThk6zol8 jvKsJ5WbR3kOmr+tc+KAp8kuMFc6Mr7Qpo6rIFsUAQKBgQDk+qMTI7tLXKKWmUGN +tixDaWnDDUHofN1gZsekhpqGSypr5MzJKkW/2gY1gSZWZtl89TcP4ozKX0BlNvD khFVbNrTKqJNPOQ0OEgixWpihkaS1CRdzYIjn/3n6XVIFxbVrrAy56d+p8LWzYLP 9NpFKtukXMp3L9bZ541x7LUowQKBgQDbEf5uk/tIM+AgE82Vyx2LIpoW8TtnOD2p WXQI/4wxkw+w1xgl88fo1ZJNbID70bQvsQyuJBI0ravZRxY+yvCUpGMtuFFhcJFe VaVzMMBAQ16zoRP6aEPM0Xv3r4ypL8Lhwg5mdc2WUG/qpo9cdocroZdRGyOifTBJ 4gOua2myeQKBgQCgBEOIMZVG0iLRSaKVPPLHsHjOJ2q7vcKsoHktwP5ynMsofglJ WVpNNwmhKZcnL4a4ldBwZnsGy/yO6V826dHxN9QodAfeICp+D8LhgcKZvap+G4Ca iO5kRP+kXPLYAUK065I40Mita0Fu6Ul8WGlcotnBoBLhfe4Qc4/WSIxFQQKBgHJA 3DXHsBJkG8wfB+XL3Uinbz3v6k9XIbGlGcNnpDJmxJQyWkHQ9r4URQ1kPZEYOaV1 7WsVHPmkajATxyJQrVCYu7EopCjxkJ9mg7ekAWCCwm1k4QqEPngf+UugnvfOFRGx J9mALwzqPrRe0f4jQzQaPtTqFpe0Ou8NlWXuV13hAoGBAJenHkdMfdigZljBQhGH gjuR/8RdZ8G2lN9wm8F6C9JJqfgMnh9KyF+w4wqI+LdItHGWdeBnY1vJqXvnIgsn CosHQw28Ot+jjULZkA2ZiCks5TeEa2h9er5NoWW0Ug/ApWTz2/SdvU/EkmSMIoX/ ylDl4wP1uKBWxn+niZDkWc6l -----END PRIVATE KEY-----
   ```

   **Variable Name:** `JWKS`  
   **Value:**
   ```
   {"keys":[{"use":"sig","kty":"RSA","n":"w_KBucmyVow1Cl-8CbnIVK8HGtXbhdowNMI5hQOQdJjB-cwSvR9_lRM2ZfplNgMgHmxmV49M0cDvz8kzSbJsAv-KmWd_e60vj-ecLBkqjp01h-ceEJ-7x8W-cGygaEg2WlNZ_mna8mCcLFJsKs3jnNnL_yAwn7sySq7cFNINuT0rSRKQQMpl7qD5Vxy_nHZY-Uw7BNpKF6Q9OzK_9ZDL8HlXJznSMv1OBkRKyao_F2V0bJwpvvR49m0OAlCNrdgWmPoW9q__5tFRBL985qvaWPJ1fBam_POEbBxGGxYgVcpQITedyXtdX-esC6bPObzyY_CRXC7pIxmmctXzOh91OQ","e":"AQAB"}]}
   ```

## After Setting the Variables

1. Restart your Convex dev server if it's running: `npx convex dev`
2. Try signing in again - the error should be resolved!

## Note

These keys are unique to your project. Keep them secure and don't commit them to version control. They're already in `.gitignore`.

