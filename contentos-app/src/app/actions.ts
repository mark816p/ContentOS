"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

/**
 * Fetches the connectivity status of the Local Engine, MCP, and SQLite.
 * @returns Object representing the status of each system component.
 */
export async function getSystemStatus() {
  let localEngineStatus = false;
  try {
    const res = await fetch("http://localhost:11434", { method: "HEAD", signal: AbortSignal.timeout(1000) });
    localEngineStatus = res.ok;
  } catch {
    localEngineStatus = false;
  }

  let dbStatus = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = true;
  } catch {
    dbStatus = false;
  }

  return {
    localEngine: localEngineStatus,
    mcp: true, // Mock MCP server status
    sqlite: dbStatus,
  };
}

/**
 * Retrieves the latest content items from the SQLite database.
 * @returns Array of ContentItem objects, ordered by updatedAt descending.
 */
export async function getContentItems() {
  try {
    const items = await prisma.contentItem.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return items;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Reads the SOUL.md and MEMORY.md files from the project root.
 * @returns Object containing the markdown string contents of the files.
 */
export async function getAgentFiles() {
  try {
    const rootDir = process.cwd();
    const soul = await fs.readFile(path.join(rootDir, "SOUL.md"), "utf-8");
    const memory = await fs.readFile(path.join(rootDir, "MEMORY.md"), "utf-8");
    return { soul, memory };
  } catch (e) {
    console.error(e);
    return { soul: "Error reading SOUL.md", memory: "Error reading MEMORY.md" };
  }
}
