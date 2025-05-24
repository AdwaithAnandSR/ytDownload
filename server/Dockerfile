FROM node:20-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    python3 -m pip install --break-system-packages --upgrade pip && \
    python3 -m pip install --break-system-packages --no-cache-dir yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY cookies.txt ./cookies.txt
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 3000

CMD python3 -m pip install --break-system-packages --upgrade yt-dlp && node index.js
