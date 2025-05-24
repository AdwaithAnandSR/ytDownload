FROM node:20-slim

# Install Python3, pip, ffmpeg, curl
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    python3 -m pip install --upgrade pip && \
    python3 -m pip install --no-cache-dir yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy YouTube cookies for authenticated downloads
COPY cookies.txt ./cookies.txt

# Copy package files and install dependencies (prod only)
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source code
COPY . .

EXPOSE 3000

# Optional: update yt-dlp on container start, then run app
CMD python3 -m pip install --upgrade yt-dlp && node index.js
