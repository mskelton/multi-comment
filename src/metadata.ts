import * as core from "@actions/core"
import yaml from "js-yaml"
import fs from "node:fs/promises"

export type Metadata = {
  intro?: string
  sections: string[]
  title?: string
}

export async function readMetadata() {
  const metadata = await fs.readFile(core.getInput("config"), "utf8")

  return yaml.load(metadata) as Metadata
}
