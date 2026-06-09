# Build + run the Inflectiv MCP server (stdio) — used by Smithery hosting and
# any OCI/container-based MCP client. Multi-stage: bundle with tsup in the build
# stage (viem/@x402 are devDeps that get bundled into dist/), then ship a slim
# runtime image with production deps only.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# stdio server: Smithery (and OCI clients) run this command and bridge stdio.
CMD ["node", "dist/index.js"]
