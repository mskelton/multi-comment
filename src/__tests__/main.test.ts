import * as core from "@actions/core"
import * as github from "@actions/github"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createComment, findComment, updateComment } from "../comments"
import { run } from "../multiComment"

vi.mock("@actions/core")
vi.mock("@actions/github")

describe(run, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should fail if no message or file path provided", async () => {
    expect.hasAssertions()

    vi.mocked(core.getInput).mockReturnValue("")

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Either "file-path" or "message" is required.')
  })

  it("should fail if no issue number found", async () => {
    expect.hasAssertions()

    vi.mocked(core.getInput).mockImplementation((key) => {
      if (key === "message") return "test message"
      return ""
    })
    vi.mocked(github.context.payload).mockReturnValue({})
    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      "No issue/pull request in input neither in current context.",
    )
  })

  it("should create new comment when none exists", async () => {
    expect.hasAssertions()

    vi.mocked(core.getInput).mockImplementation((key) => {
      if (key === "message") return "test message"
      if (key === "section") return "test-section"
      return ""
    })
    vi.mocked(github.context.payload).mockReturnValue({ pull_request: { number: 123 } })
    vi.mocked(findComment).mockResolvedValue(null)
    vi.mocked(createComment).mockResolvedValue({ html_url: "test-url", id: 456 })

    await run()

    expect(createComment).toHaveBeenCalledWith(123, "test-section", "test message")
    expect(core.setOutput).toHaveBeenCalledWith("id", 456)
    expect(core.setOutput).toHaveBeenCalledWith("html-url", "test-url")
  })

  it("should update existing comment", async () => {
    expect.hasAssertions()

    vi.mocked(core.getInput).mockImplementation((key) => {
      if (key === "message") return "test message"
      if (key === "section") return "test-section"
      return ""
    })
    vi.mocked(github.context.payload).mockReturnValue({ pull_request: { number: 123 } })
    vi.mocked(findComment).mockResolvedValue({ id: 456 })
    vi.mocked(updateComment).mockResolvedValue({ html_url: "test-url", id: 456 })

    await run()

    expect(updateComment).toHaveBeenCalledWith(456, "test-section", "test message")
    expect(core.setOutput).toHaveBeenCalledWith("id", 456)
    expect(core.setOutput).toHaveBeenCalledWith("html-url", "test-url")
  })
})
