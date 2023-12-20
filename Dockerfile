# Stage 1: Build the application
FROM node:21.4.0-alpine3.19 as builder

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies
RUN npm install 

# Copy the source code from host to image filesystem
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the server
FROM node:21.4.0-alpine3.19

# Set the working directory
WORKDIR /app

# Set the NODE_ENV to production
ENV NODE_ENV production

# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Set non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permissions
RUN mkdir .next

# Copy the build from the previous stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Change ownership to non-root user
RUN chown -R nextjs:nodejs .next

# Set user to use when running this image
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Environment variables
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

# Start the application
CMD ["npm", "start"]
