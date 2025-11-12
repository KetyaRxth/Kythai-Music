const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

class CanvasPlayer {
    /**
     * Creates a beautiful canvas-based player image
     * @param {Object} track - The current track
     * @param {Object} playerState - Player state (paused, position, volume, etc.)
     * @param {Object} queue - Queue array
     * @param {Object} client - Discord client
     * @returns {Promise<AttachmentBuilder>}
     */
    static async createPlayerImage(track, playerState = {}, queue = [], client = null) {
        try {
            const canvas = createCanvas(1200, 400);
            const ctx = canvas.getContext('2d');

            // Get accent color from client
            let accentColor = '2b2d31';
            if (client?.color) {
                if (typeof client.color === 'string') {
                    accentColor = client.color.replace('#', '');
                } else {
                    accentColor = client.color.toString(16).padStart(6, '0');
                }
            }
            const accentRgb = this.hexToRgb('#' + accentColor);

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 1200, 400);
            gradient.addColorStop(0, `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`);
            gradient.addColorStop(1, `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.05)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1200, 400);

            // Main background with rounded corners effect
            ctx.fillStyle = '#1a1b1e';
            this.roundRect(ctx, 20, 20, 1160, 360, 20);
            ctx.fill();

            // Load and draw thumbnail if available
            if (track?.thumbnail) {
                try {
                    const thumbnail = await loadImage(track.thumbnail);
                    const thumbSize = 320;
                    const thumbX = 40;
                    const thumbY = 40;
                    
                    // Draw thumbnail with rounded corners
                    ctx.save();
                    this.roundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 15);
                    ctx.clip();
                    ctx.drawImage(thumbnail, thumbX, thumbY, thumbSize, thumbSize);
                    ctx.restore();

                    // Thumbnail border
                    ctx.strokeStyle = `#${accentColor}`;
                    ctx.lineWidth = 3;
                    this.roundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 15);
                    ctx.stroke();
                } catch (err) {
                    // If thumbnail fails to load, draw a placeholder
                    ctx.fillStyle = `#${accentColor}`;
                    this.roundRect(ctx, 40, 40, 320, 320, 15);
                    ctx.fill();
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 48px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('🎵', 200, 220);
                }
            } else {
                // Placeholder if no thumbnail
                ctx.fillStyle = `#${accentColor}`;
                this.roundRect(ctx, 40, 40, 320, 320, 15);
                ctx.fill();
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🎵', 200, 220);
            }

            // Track info section
            const infoX = 400;
            const infoY = 60;

            // Track title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 42px Arial';
            ctx.textAlign = 'left';
            const title = this.truncateText(ctx, track?.title || 'Unknown Track', 700);
            ctx.fillText(title, infoX, infoY);

            // Artist/Author
            if (track?.author) {
                ctx.fillStyle = '#b9bbbe';
                ctx.font = '32px Arial';
                ctx.fillText(this.truncateText(ctx, track.author, 700), infoX, infoY + 50);
            }

            // Duration and position
            const position = playerState?.position || '0:00';
            const duration = track?.duration || '0:00';
            ctx.fillStyle = '#72767d';
            ctx.font = '28px Arial';
            ctx.fillText(`${position} / ${duration}`, infoX, infoY + 100);

            // Progress bar
            const progressX = infoX;
            const progressY = infoY + 140;
            const progressWidth = 700;
            const progressHeight = 8;
            const progressPercent = this.getProgressPercent(position, duration);

            // Progress bar background
            ctx.fillStyle = '#2f3136';
            this.roundRect(ctx, progressX, progressY, progressWidth, progressHeight, 4);
            ctx.fill();

            // Progress bar fill
            const fillWidth = (progressWidth * progressPercent) / 100;
            if (fillWidth > 0) {
                ctx.fillStyle = `#${accentColor}`;
                this.roundRect(ctx, progressX, progressY, fillWidth, progressHeight, 4);
                ctx.fill();
            }

            // Player controls icons (visual representation)
            const controlsY = infoY + 200;
            const controlsX = infoX;
            const iconSize = 50;
            const iconSpacing = 80;

            // Loop icon
            const loopEmoji = this.getRepeatEmoji(playerState?.repeatMode);
            ctx.font = '40px Arial';
            ctx.fillText(loopEmoji, controlsX, controlsY);

            // Pause/Play icon
            const playPauseEmoji = playerState?.paused ? '▶️' : '⏸️';
            ctx.fillText(playPauseEmoji, controlsX + iconSpacing, controlsY);

            // Volume icon
            ctx.fillText('🔊', controlsX + iconSpacing * 2, controlsY);
            if (playerState?.volume) {
                ctx.fillStyle = '#72767d';
                ctx.font = '24px Arial';
                ctx.fillText(`${playerState.volume}%`, controlsX + iconSpacing * 2 + 40, controlsY);
            }

            // Queue info
            if (queue && queue.length > 0) {
                const queueArray = Array.isArray(queue) ? queue : Array.from(queue);
                const queueText = `Queue: ${queueArray.length} track${queueArray.length !== 1 ? 's' : ''}`;
                ctx.fillStyle = '#72767d';
                ctx.font = '26px Arial';
                ctx.fillText(queueText, controlsX, controlsY + 50);
            }

            // Status indicator
            const statusX = 1100;
            const statusY = 50;
            ctx.fillStyle = playerState?.paused ? '#faa61a' : '#43b581';
            ctx.beginPath();
            ctx.arc(statusX, statusY, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(playerState?.paused ? 'PAUSED' : 'PLAYING', statusX - 20, statusY + 5);

            // Convert to buffer and create attachment
            const buffer = canvas.toBuffer('image/png');
            return new AttachmentBuilder(buffer, { name: 'player.png' });
        } catch (error) {
            console.error('Error creating player canvas:', error);
            // Return a simple fallback
            return null;
        }
    }

    /**
     * Helper to draw rounded rectangles
     */
    static roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Convert hex to RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 43, g: 45, b: 49 };
    }

    /**
     * Truncate text to fit width
     */
    static truncateText(ctx, text, maxWidth) {
        const metrics = ctx.measureText(text);
        if (metrics.width <= maxWidth) return text;
        
        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        return truncated + '...';
    }

    /**
     * Get progress percentage from time strings
     */
    static getProgressPercent(current, total) {
        const currentSeconds = this.timeToSeconds(current);
        const totalSeconds = this.timeToSeconds(total);
        
        if (isNaN(currentSeconds) || isNaN(totalSeconds) || totalSeconds === 0) {
            return 0;
        }
        
        return Math.min(100, Math.max(0, (currentSeconds / totalSeconds) * 100));
    }

    /**
     * Convert time string to seconds
     */
    static timeToSeconds(timeString) {
        if (!timeString) return 0;
        
        const parts = timeString.split(':').map(Number);
        if (parts.some(isNaN)) return 0;
        
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        
        return 0;
    }

    /**
     * Get repeat emoji based on mode
     */
    static getRepeatEmoji(repeatMode) {
        switch (repeatMode) {
            case 'track': return '🔂';
            case 'queue': return '🔁';
            default: return '▶️';
        }
    }
}

module.exports = CanvasPlayer;

