# Environment Variables Setup

This bot requires several environment variables to be set. Create a `.env` file in the root directory with the following variables:

## Required Variables

### Discord Bot Configuration
```env
token=YOUR_DISCORD_BOT_TOKEN_HERE
```
**OR**
```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
```

### MongoDB Configuration
```env
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
```
**OR**
```env
Mongo=YOUR_MONGODB_CONNECTION_STRING_HERE
```

## Optional Variables

### Discord OAuth (for Dashboard)
```env
CLIENT_ID=YOUR_DISCORD_CLIENT_ID
CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET
DASHBOARD_URL=http://localhost:3000
SESSION_SECRET=YOUR_RANDOM_SESSION_SECRET_HERE
```

### Top.gg API
```env
TOPGG_API=YOUR_TOPGG_API_KEY
```

### Spotify Configuration
```env
SPOTIFY_ID=YOUR_SPOTIFY_CLIENT_ID
SPOTIFY_SECRET=YOUR_SPOTIFY_CLIENT_SECRET
```

### Lavalink Configuration
```env
LAVALINK_URL=lavalink.jirayu.net:13592
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

### Webhook URLs (for logging)
```env
NOPREFIX_LOG_WEBHOOK=YOUR_WEBHOOK_URL
CMD_LOG_WEBHOOK=YOUR_WEBHOOK_URL
ERROR_LOG_WEBHOOK=YOUR_WEBHOOK_URL
BLACKLIST_LOG_WEBHOOK=YOUR_WEBHOOK_URL
JOIN_LOG_WEBHOOK=YOUR_WEBHOOK_URL
LEAVE_LOG_WEBHOOK=YOUR_WEBHOOK_URL
```

## Setup Instructions

1. Copy the example above and create a `.env` file in the root directory
2. Fill in all the required values
3. **Never commit the `.env` file to git** (it's already in `.gitignore`)
4. The bot will automatically load these variables when it starts

## Security Notes

- ⚠️ **Never share your `.env` file or commit it to version control**
- ⚠️ **If you accidentally committed secrets, rotate them immediately**
- ✅ The `.env` file is automatically ignored by git
- ✅ All sensitive values should be stored in environment variables

