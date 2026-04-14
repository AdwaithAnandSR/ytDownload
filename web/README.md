# VividMusic Uploader

Bulk YouTube → Cloudinary audio uploader with live status tracking, MongoDB persistence, and 24-hour session history.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your MONGODB_URI
npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `PORT` | No | Server port (default: 3000) |

## API Routes

### Music
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/music/addSong` | Save a song to MongoDB |
| `POST` | `/api/music/isExists` | Check if song exists by `ytId` or `title` |

### Upload
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/start` | Start an upload session |
| `GET` | `/api/upload/status/:id` | SSE stream for live updates |
| `GET` | `/api/upload/session/:id` | Get session snapshot |
| `GET` | `/api/upload/sessions` | List all active sessions |

## Features

- ✅ Single video, full playlist, or channel bulk upload
- ✅ Limit + skip for pagination through large playlists
- ✅ Existence check before processing (by `ytId` and `title`)
- ✅ YouTube audio streamed directly into Cloudinary (no local disk usage)
- ✅ Auto-rollback: Cloudinary asset deleted if MongoDB save fails
- ✅ 3-concurrent-job queue with live SSE status
- ✅ Individual + group status, error messages, progress %
- ✅ Virtual infinite list for queues of any size
- ✅ Sessions persist for 24 hours after completion
- ✅ Credentials stored in-memory only, purged with session
- ✅ Mobile-friendly dark UI with session reconnect on page reload
