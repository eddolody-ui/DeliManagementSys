# TODO: Fix User Save to DB Issue

## Issue Resolved
- [x] Fixed bcrypt import mismatch: Changed 'bcryptjs' to 'bcrypt' in User.ts and seedUsers.ts to match installed package
- [x] Users can now be saved to the database successfully

## Previous Steps Completed
- [x] Add pre-save hook in User.ts to hash passwords only if not already hashed (check if starts with '$' for bcrypt hashes)
- [x] Rename scripts/seedUsers.js to scripts/seedUsers.ts and update to use ES6 import for User model
- [x] Run the seed script using ts-node to seed users into the database
- [ ] Verify users are seeded and login works (optional test)
