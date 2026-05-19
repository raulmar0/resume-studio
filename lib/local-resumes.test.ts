import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCAL_RESUMES_KEY,
  assertLocalResumeStorageAvailable,
  createLocalResume,
  deleteLocalResume,
  duplicateLocalResume,
  getLocalResume,
  listLocalResumes,
  renameLocalResume,
  saveLocalResume,
} from "./local-resumes";
import { defaultTheme, emptyDocument } from "./schemas/resume";

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

function installStorage(storage: Storage = new MemoryStorage()) {
  vi.stubGlobal("localStorage", storage);
}

describe("local resumes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    installStorage();
  });

  it("lists an empty store when no local data exists", () => {
    expect(listLocalResumes()).toEqual([]);
  });

  it("creates a resume with a local id and default content", () => {
    const resume = createLocalResume({
      title: "Backend Resume",
      templateId: "modern",
    });

    expect(resume.id).toMatch(/^local-/);
    expect(resume.title).toBe("Backend Resume");
    expect(resume.templateId).toBe("modern");
    expect(resume.theme).toEqual(defaultTheme());
    expect(resume.document.contact).toEqual(emptyDocument().contact);
    expect(resume.document.sections.map((section) => section.kind)).toEqual([
      "summary",
      "experience",
      "education",
      "skills",
    ]);
    expect(getLocalResume(resume.id)).toEqual(resume);
  });

  it("lists resumes sorted by most recently updated", () => {
    const first = createLocalResume({ title: "First", templateId: "minimal" });
    const second = createLocalResume({ title: "Second", templateId: "classic" });

    saveLocalResume(first.id, { title: "First updated" });

    expect(listLocalResumes().map((resume) => resume.id)).toEqual([
      first.id,
      second.id,
    ]);
  });

  it("saves document, theme, template, and title patches", () => {
    const resume = createLocalResume({ title: "Draft", templateId: "minimal" });
    const document = emptyDocument();
    document.contact.fullName = "Jane Doe";
    const theme = { ...defaultTheme(), accent: "#2563eb" };

    const updated = saveLocalResume(resume.id, {
      title: "Updated",
      document,
      theme,
      templateId: "classic",
    });

    expect(updated.title).toBe("Updated");
    expect(updated.document.contact.fullName).toBe("Jane Doe");
    expect(updated.theme.accent).toBe("#2563eb");
    expect(updated.templateId).toBe("classic");
  });

  it("renames blank titles to Untitled Resume", () => {
    const resume = createLocalResume({ title: "Draft", templateId: "minimal" });

    expect(renameLocalResume(resume.id, "   ")?.title).toBe("Untitled Resume");
  });

  it("duplicates a resume with a new id and copied content", () => {
    const resume = createLocalResume({ title: "Source", templateId: "modern" });
    const document = emptyDocument();
    document.contact.fullName = "Copied Person";
    saveLocalResume(resume.id, { document });

    const copy = duplicateLocalResume(resume.id);

    expect(copy).not.toBeNull();
    expect(copy?.id).not.toBe(resume.id);
    expect(copy?.title).toBe("Source (copy)");
    expect(copy?.document.contact.fullName).toBe("Copied Person");
  });

  it("deletes a resume", () => {
    const resume = createLocalResume({ title: "Delete", templateId: "minimal" });

    deleteLocalResume(resume.id);

    expect(getLocalResume(resume.id)).toBeNull();
  });

  it("handles corrupt JSON without throwing", () => {
    localStorage.setItem(LOCAL_RESUMES_KEY, "{");

    expect(() => listLocalResumes()).not.toThrow();
    expect(listLocalResumes()).toEqual([]);
  });

  it("handles invalid schema without throwing", () => {
    localStorage.setItem(
      LOCAL_RESUMES_KEY,
      JSON.stringify({ version: 1, resumes: [{ id: "" }] }),
    );

    expect(() => listLocalResumes()).not.toThrow();
    expect(listLocalResumes()).toEqual([]);
  });

  it("throws storage write failures", () => {
    const storage = new MemoryStorage();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    installStorage(storage);

    expect(() =>
      createLocalResume({ title: "Too large", templateId: "minimal" }),
    ).toThrow("Could not save local resumes");
  });

  it("reports unavailable storage during the availability probe", () => {
    const storage = new MemoryStorage();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new DOMException("Storage disabled", "SecurityError");
    });
    installStorage(storage);

    expect(() => assertLocalResumeStorageAvailable()).toThrow(
      "Local storage is not available",
    );
  });
});
