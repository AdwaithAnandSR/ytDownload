FROM node:20

# Install Python, pip, ffmpeg, and yt-dlp
RUN apt-get update && \
apt-get install -y python3 python3-pip ffmpeg && \
pip install yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]