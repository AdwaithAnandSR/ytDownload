import { spawn } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

const BASE_URL = "http://localhost:5000/temp";

// ─────────────────────────────────────────────
// Fetch helpers
// ─────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return res;
    } finally {
        clearTimeout(id);
    }
}

async function retry(fn, retries = 2) {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        return retry(fn, retries - 1);
    }
}

// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────
async function bulkCheckExists(items) {
    const res = await fetchWithTimeout(`${BASE_URL}/bulkExists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    return data.results;
}

async function addSongAPI(payload) {
    const res = await fetchWithTimeout(`${BASE_URL}/addSong`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    return data.song;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const CONCURRENCY = 3;
const SESSION_TTL = 24 * 60 * 60 * 1000;
const CLEANUP_INT = 60 * 60 * 1000;

// ─────────────────────────────────────────────
// Stores
// ─────────────────────────────────────────────
export const sessions = new Map();
export const sseClients = new Map();

// ─────────────────────────────────────────────
// SSE
// ─────────────────────────────────────────────
export function addSSEClient(sessionId, res) {
    if (!sseClients.has(sessionId)) sseClients.set(sessionId, new Set());
    sseClients.get(sessionId).add(res);
}

export function removeSSEClient(sessionId, res) {
    sseClients.get(sessionId)?.delete(res);
}

function emit(sessionId, type, payload = {}) {
    const clients = sseClients.get(sessionId);
    if (!clients) return;

    const msg = `data: ${JSON.stringify({ type, ...payload })}\n\n`;

    for (const res of clients) {
        try {
            res.write(msg);
        } catch {}
    }
}

// ─────────────────────────────────────────────
// yt-dlp helpers
// ─────────────────────────────────────────────
async function getYtDlpInfo(source) {
    return new Promise((resolve, reject) => {
        const proc = spawn("yt-dlp", ["-J", "--flat-playlist", source]);

        let data = "";

        proc.stdout.on("data", c => (data += c.toString()));

        proc.stderr.on("data", d => {
            console.error("yt-dlp stderr:", d.toString());
        });

        proc.on("close", code => {
            if (code !== 0) return reject(new Error("yt-dlp info failed"));

            try {
                const json = JSON.parse(data);

                if (json.entries) {
                    return resolve(
                        json.entries.map(e => ({
                            videoId: e.id,
                            title: e.title,
                            thumbnail: e.thumbnail,
                            duration: e.duration,
                            author: e.uploader || "Unknown"
                        }))
                    );
                }

                resolve([
                    {
                        videoId: json.id,
                        title: json.title,
                        thumbnail: json.thumbnail,
                        duration: json.duration,
                        author: json.uploader || "Unknown"
                    }
                ]);
            } catch (err) {
                reject(err);
            }
        });
    });
}

// ─────────────────────────────────────────────
// Cloudinary
// ─────────────────────────────────────────────
function configureCloudinary(credentials) {
    cloudinary.config({
        cloud_name: credentials.cloudName,
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
        secure: true
    });
}

function uploadAudioStream(videoId, credentials, onProgress) {
    return new Promise((resolve, reject) => {
        configureCloudinary(credentials);

        const url = `https://www.youtube.com/watch?v=${videoId}`;

        const yt = spawn("yt-dlp", [
            "-f",
            "bestaudio",
            "-o",
            "-",
            "--newline",
            "--no-playlist",
            url
        ]);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder: "vividmusic",
                public_id: `yt_${videoId}`,
                format: "mp3"
            },
            (err, result) => (err ? reject(err) : resolve(result))
        );

        yt.stdout.pipe(uploadStream);

        let lastEmit = 0;

        yt.stderr.on("data", chunk => {
            const line = chunk.toString();
            const match = line.match(/(\d+(\.\d+)?)%/);

            if (match) {
                const pct = Math.round(parseFloat(match[1]));
                const now = Date.now();

                if (now - lastEmit > 500 || pct === 100) {
                    onProgress(pct);
                    lastEmit = now;
                }
            }
        });

        yt.on("error", reject);
        uploadStream.on("error", reject);

        yt.on("close", code => {
            if (code !== 0) reject(new Error("yt-dlp failed"));
        });
    });
}

// ─────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────
export function createSession({ credentials, source, limit, skip }) {
    const id = uuidv4();

    const session = {
        id,
        credentials,
        source,
        limit,
        skip,
        status: "initializing",
        jobs: [],
        stats: {},
        startedAt: new Date()
    };

    sessions.set(id, session);
    return session;
}

function recalcStats(session) {
    const stats = {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        skipped: 0,
        failed: 0
    };

    for (const j of session.jobs) {
        stats.total++;
        if (j.status === "pending") stats.pending++;
        else if (
            ["processing", "downloading", "uploading", "saving"].includes(
                j.status
            )
        )
            stats.processing++;
        else if (j.status === "completed") stats.completed++;
        else if (j.status === "skipped") stats.skipped++;
        else if (j.status === "failed") stats.failed++;
    }

    session.stats = stats;
}

function updateAndEmit(session, job) {
    recalcStats(session);
    emit(session.id, "job_update", { job, stats: session.stats });
}

// ─────────────────────────────────────────────
// Queue worker
// ─────────────────────────────────────────────
async function processJob(job, session) {
    try {
        job.status = "processing";
        updateAndEmit(session, job);

        job.startedAt = new Date();

        job.status = "downloading";
        updateAndEmit(session, job);

        const cloud = await retry(() =>
            uploadAudioStream(job.videoId, session.credentials, pct => {
                job.progress = pct;
                job.status = pct < 95 ? "downloading" : "uploading";
                updateAndEmit(session, job);
            })
        );

        job.status = "saving";
        updateAndEmit(session, job);

        await addSongAPI({
            title: job.title || `YT ${job.videoId}`,
            artist: job.author || "Unknown",
            url: cloud.secure_url,
            cover: job.thumbnail,
            duration: job.duration,
            ytId: job.videoId
        });

        job.status = "completed";
        job.completedAt = new Date();
        job.cloudinaryUrl = cloud.secure_url;

        updateAndEmit(session, job);
    } catch (err) {
        job.status = "failed";
        job.error = err.message;
        updateAndEmit(session, job);
    }
}

async function runQueue(session) {
    const jobs = session.jobs;
    let index = 0,
        active = 0;

    return new Promise(resolve => {
        function next() {
            while (active < CONCURRENCY && index < jobs.length) {
                const job = jobs[index++];

                if (job.status === "skipped") continue;

                active++;

                processJob(job, session).finally(() => {
                    active--;
                    if (active === 0 && index >= jobs.length) resolve();
                    else next();
                });
            }
        }
        next();
    });
}

// ─────────────────────────────────────────────
// Start session
// ─────────────────────────────────────────────
export async function startSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    try {
        emit(sessionId, "status", { message: "Fetching videos…" });

        const items = await getYtDlpInfo(session.source);

        emit(sessionId, "status", { message: "Checking existing songs…" });

        const bulk = await bulkCheckExists(
            items.map(i => ({ title: i.title, ytId: i.videoId }))
        );

        const map = new Map();
        bulk.forEach(r => {
            if (r.ytId) map.set(r.ytId, r);
            if (r.title) map.set(r.title, r);
        });

        session.jobs = items
            .slice(session.skip, session.skip + session.limit)
            .map(item => {
                const exists = map.get(item.videoId) || map.get(item.title);

                return {
                    id: uuidv4(),
                    videoId: item.videoId,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    duration: item.duration,
                    author: item.author,
                    status: exists?.exists ? "skipped" : "pending",
                    progress: 0,
                    error: exists?.exists ? "Already exists" : null
                };
            });

        recalcStats(session);

        emit(sessionId, "initialized", {
            jobs: session.jobs,
            stats: session.stats
        });

        session.status = "running";

        await runQueue(session);

        session.status = "completed";
        session.completedAt = new Date();
        session.expiresAt = new Date(Date.now() + SESSION_TTL);

        recalcStats(session);

        emit(sessionId, "completed", { stats: session.stats });
    } catch (err) {
        session.status = "failed";

        emit(sessionId, "error", { message: err.message });
    }
}

// ─────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────
export function startCleanupInterval() {
    setInterval(() => {
        const now = Date.now();

        for (const [id, session] of sessions) {
            if (session.expiresAt && now > session.expiresAt.getTime()) {
                sessions.delete(id);
                sseClients.delete(id);
            }
        }
    }, CLEANUP_INT);
}
