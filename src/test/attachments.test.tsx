/** « Photos et documents (facultatif) » : choisir, voir, retirer, et les messages lus à voix haute. */
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AttachmentsField } from "@/components/garage/attachments";

function Form() {
  const [files, setFiles] = useState<File[]>([]);
  return <AttachmentsField id="rp-files" files={files} onChange={setFiles} />;
}

const photo = (nom: string) => new File(["jpeg"], nom, { type: "image/jpeg", lastModified: 1 });
const pdf = (nom: string) => new File(["%PDF-1.4"], nom, { type: "application/pdf" });
const choose = (...files: File[]) =>
  fireEvent.change(screen.getByLabelText(/Ajouter/), { target: { files } });

beforeEach(() => {
  let n = 0;
  URL.createObjectURL = vi.fn(() => `blob:vignette-${++n}`);
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe("AttachmentsField", () => {
  it("offre le champ, son aide et les bons formats", () => {
    render(<Form />);
    const input = screen.getByLabelText(/Ajouter des photos ou des documents/);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp,application/pdf");
    expect(input).not.toHaveAttribute("capture");
    expect(input).toHaveAccessibleDescription(/Par exemple.*5 fichiers au plus \(photos ou PDF\)/);
    expect(screen.getByRole("group", { name: /Photos et documents \(facultatif\)/ })).toBeTruthy();
  });

  it("montre une vignette par photo et le nom de chaque PDF, puis retire un fichier", () => {
    render(<Form />);
    choose(photo("avant.jpg"), pdf("permis.pdf"));
    expect(screen.getByRole("img", { name: "avant.jpg" })).toHaveAttribute(
      "src",
      "blob:vignette-1",
    );
    expect(screen.getByText("permis.pdf")).toBeTruthy();
    expect(screen.getByText(/2 fichiers ajoutés, 2 sur 5/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Retirer «\u00a0avant.jpg\u00a0»" }));
    expect(screen.queryByRole("img", { name: "avant.jpg" })).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:vignette-1");
    expect(screen.getByText(/« avant.jpg » retiré/)).toBeTruthy();
    // the focus goes to the next file's « Retirer »
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Retirer «\u00a0permis.pdf\u00a0»" }),
    );
  });

  it("dit ce qui n'a pas été ajouté, et ne propose plus d'ajouter à 5 fichiers", () => {
    render(<Form />);
    choose(new File(["x"], "notes.docx", { type: "application/msword" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "« notes.docx » n’est ni une photo ni un PDF.",
    );

    choose(...["1", "2", "3", "4", "5", "6"].map((i) => photo(`${i}.jpg`)));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "5 fichiers au plus : un fichier n’a pas été ajouté.",
    );
    expect(screen.queryByText(/Ajouter d’autres fichiers/)).toBeNull();
    expect(document.getElementById("rp-files")).toBeDisabled();
  });
});
