# Checking Environment Variables

## Quick Check

To verify your `.env` file is being read correctly:

1. **Check your `.env` file location:**
   - Should be in: `Tabdeer_backend-1-/.env`
   - Same directory as `server.js`

2. **Check your `.env` file format:**
   ```env
   ADMIN_SECRET_KEY=your_secret_key_here
   ```
   - No spaces around `=`
   - No quotes needed
   - No semicolons

3. **Restart your backend server** after adding/changing `.env`

4. **Check console logs** when attempting admin registration:
   - You'll see debug logs showing what key is expected vs provided
   - Look for: `🔐 Admin Registration Attempt:`

## Testing

1. Add `ADMIN_SECRET_KEY=my_custom_key_123` to your `.env`
2. Restart backend: `npm start` or `node server.js`
3. Try registering as admin with `my_custom_key_123`
4. Check backend console for debug logs

## Common Issues

**Issue:** Default key works but custom key doesn't
**Solution:** 
- Make sure `.env` is in the backend root folder
- Restart the server after editing `.env`
- Check for typos in variable name: `ADMIN_SECRET_KEY` (not `ADMIN_SECRET` or `ADMIN_KEY`)

**Issue:** Environment variable not loading
**Solution:**
- Verify `dotenv.config()` is called in `server.js` (it is, on line 12)
- Make sure `.env` file exists in `Tabdeer_backend-1-/` folder
- Check file name is exactly `.env` (not `.env.local` or `env`)

