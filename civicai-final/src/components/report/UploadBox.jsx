import { useState } from "react";
import { C } from "../../utils/constants";

export default function UploadBox({ onFileSelect, preview }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onFileSelect(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? C.teal : C.borderMid}`,
        borderRadius: "var(--radius-md)",
        padding: preview ? 0 : 24,
        textAlign: "center",
        background: dragging ? C.tealLight : "#FAFBFD",
        transition: "var(--transition)",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <input
        type="file" accept="image/*"
        style={{ display: "none" }}
        id="upload-input"
        onChange={e => onFileSelect(e.target.files[0])}
      />
      <label htmlFor="upload-input" style={{ cursor: "pointer", display: "block" }}>
        {preview ? (
          <div style={{ position: "relative" }}>
            <img src={preview} alt="preview" style={{
              width: "100%", maxHeight: 200,
              objectFit: "cover", display: "block",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(0,0,0,0.5)", color: C.white,
              fontSize: 11, fontWeight: 600, padding: "6px",
              textAlign: "center",
            }}>
              📸 Click to change photo
            </div>
          </div>
        ) : (
          <div style={{ padding: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              Upload or drag a photo
            </div>
            <div style={{ fontSize: 11, color: C.textLight }}>
              JPEG, PNG, WebP · Max 10 MB
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
