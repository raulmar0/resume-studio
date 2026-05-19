import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalResume, getLocalResume } from "../local-resumes";
import { defaultTheme, emptyDocument } from "../schemas/resume";
import { persistAutosave } from "./autosave-persistence";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

describe("autosave persistence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  it("writes local autosave payloads to localStorage", async () => {
    const resume = createLocalResume({ title: "Local", templateId: "minimal" });
    const document = emptyDocument();
    document.contact.fullName = "Local Person";
    const theme = { ...defaultTheme(), accent: "#16a34a" };

    await persistAutosave({
      mode: "local",
      resumeId: resume.id,
      document,
      theme,
      templateId: "classic",
    });

    const saved = getLocalResume(resume.id);
    expect(saved?.document.contact.fullName).toBe("Local Person");
    expect(saved?.theme.accent).toBe("#16a34a");
    expect(saved?.templateId).toBe("classic");
  });

  it("surfaces local storage write failures", async () => {
    const resume = createLocalResume({ title: "Local", templateId: "minimal" });
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    await expect(
      persistAutosave({
        mode: "local",
        resumeId: resume.id,
        document: emptyDocument(),
        theme: defaultTheme(),
        templateId: "minimal",
      }),
    ).rejects.toThrow("Could not save local resumes");
  });

  it("delegates cloud autosaves to the provided cloud saver", async () => {
    const saveCloud = vi.fn(async () => {});
    const document = emptyDocument();
    const theme = defaultTheme();

    await persistAutosave({
      mode: "cloud",
      resumeId: "cloud-id",
      document,
      theme,
      templateId: "minimal",
      saveCloud,
    });

    expect(saveCloud).toHaveBeenCalledWith("cloud-id", {
      document,
      theme,
      templateId: "minimal",
    });
  });
});
