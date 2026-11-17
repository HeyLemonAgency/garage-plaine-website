// « Photos et documents (facultatif) »: the files a visitor joins to a form (the reprise form
// today). The rules live in src/lib/pieces-jointes.ts; here, picking (camera, gallery or files,
// or a drop on a computer), the thumbnails and the PDF names, removing one, and the messages
// read by screen readers. The files are prepared and sent with the form (sendToGarage).
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Camera, FileText, ImageIcon, Plus, X } from "lucide-react";
import {
  FICHIERS_MAX,
  FORMATS_ACCEPTES,
  ajouterFichiers,
  estPdf,
  tailleLisible,
} from "@/lib/pieces-jointes";

const NBSP = " ";
const key = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

/** A photo's thumbnail, from a blob: URL freed as soon as the photo leaves the list. */
function Thumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    if (typeof URL.createObjectURL !== "function") return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (broken || !url)
    // a photo this browser cannot show (an HEIC on Chrome): its name instead
    return (
      <>
        <ImageIcon aria-hidden="true" />
        <span className="attach-name">{file.name}</span>
      </>
    );
  return <img src={url} alt={file.name} onError={() => setBroken(true)} />;
}

export function AttachmentsField({
  id,
  files,
  onChange,
  disabled = false,
}: {
  id: string;
  files: readonly File[];
  onChange: (files: File[]) => void;
  /** While the form is sending: nothing can be added or removed. */
  disabled?: boolean;
}) {
  const [problems, setProblems] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const focusAfter = useRef<number | "input" | null>(null);
  const full = files.length >= FICHIERS_MAX;
  const hintId = `${id}-hint`;

  // after a removal, the focus goes to the next file's « Retirer », or back to the picker
  useEffect(() => {
    const target = focusAfter.current;
    focusAfter.current = null;
    if (target === null) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(".attach-remove");
    if (target !== "input" && buttons?.length)
      buttons[Math.min(target, buttons.length - 1)]?.focus();
    else inputRef.current?.focus();
  }, [files]);

  function add(picked: File[]) {
    if (!picked.length) return;
    const { fichiers, refus } = ajouterFichiers(files, picked);
    setProblems(refus);
    const added = fichiers.length - files.length;
    if (added > 0) {
      onChange(fichiers);
      setAnnounce(
        `${added === 1 ? "Un fichier ajouté" : `${added} fichiers ajoutés`}, ${fichiers.length} sur ${FICHIERS_MAX}.`,
      );
      // the picker is no longer offered at 5 files: the focus stays in the list
      if (fichiers.length >= FICHIERS_MAX) focusAfter.current = fichiers.length - 1;
    }
  }

  function remove(index: number) {
    const file = files[index];
    if (!file) return;
    const next = files.filter((_, i) => i !== index);
    focusAfter.current = next.length ? index : "input";
    setProblems([]);
    setAnnounce(`«${NBSP}${file.name}${NBSP}» retiré.`);
    onChange(next);
  }

  function drop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    add(Array.from(e.dataTransfer.files));
  }

  return (
    <fieldset className="form-section attach" disabled={disabled}>
      <legend>
        Photos et documents <span className="attach-optional">(facultatif)</span>
      </legend>
      {files.length > 0 && (
        <ul className="attach-list" aria-label="Fichiers choisis" ref={listRef}>
          {files.map((f, i) => {
            const pdf = estPdf(f);
            return (
              <li key={key(f)} className={pdf ? "attach-tile is-doc" : "attach-tile"}>
                {pdf ? (
                  <>
                    <FileText aria-hidden="true" />
                    <span className="attach-name">{f.name}</span>
                    <span className="attach-size">{tailleLisible(f.size)}</span>
                  </>
                ) : (
                  <Thumb file={f} />
                )}
                <button
                  type="button"
                  className="attach-remove"
                  aria-label={`Retirer «${NBSP}${f.name}${NBSP}»`}
                  title="Retirer"
                  onClick={() => remove(i)}
                >
                  <X aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={FORMATS_ACCEPTES}
        className="attach-input"
        aria-describedby={hintId}
        disabled={full}
        onChange={(e) => {
          add(Array.from(e.currentTarget.files ?? []));
          // the same file can be picked again after being removed
          e.currentTarget.value = "";
        }}
      />
      {!full && (
        <label
          htmlFor={id}
          className={`attach-pick${files.length ? " is-more" : ""}${over ? " is-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={drop}
        >
          <span className="attach-pick-icon" aria-hidden="true">
            {files.length ? <Plus /> : <Camera />}
          </span>
          <span className="attach-pick-text">
            <strong>
              {files.length ? "Ajouter d’autres fichiers" : "Ajouter des photos ou des documents"}
            </strong>
            <span>
              {files.length
                ? `Encore ${FICHIERS_MAX - files.length} au plus`
                : "Appareil photo, galerie ou fichiers"}
            </span>
          </span>
        </label>
      )}
      <p id={hintId} className="field-hint">
        Par exemple{NBSP}: photos de l’extérieur, de l’intérieur, du compteur, le permis de
        circulation. {FICHIERS_MAX} fichiers au plus (photos ou PDF).
      </p>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      {problems.length > 0 && (
        <div role="alert" className="form-status form-error attach-problems">
          {problems.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
    </fieldset>
  );
}
