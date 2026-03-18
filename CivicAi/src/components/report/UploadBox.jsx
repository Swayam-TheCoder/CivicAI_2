import { C } from "../../utils/constants";

export default function UploadBox({ onFileSelect, preview }) {
  return (
    <div
      style={{
        border: `2px dashed ${C.border}`,
        borderRadius: 10,
        padding: 16,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        id="upload-input"
        onChange={(e) => onFileSelect(e.target.files[0])}
      />

      <label htmlFor="upload-input" style={{ cursor: "pointer" }}>
        📸 Upload Image
      </label>

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            width: "100%",
            marginTop: 10,
            borderRadius: 8,
          }}
        />
      )}
    </div>
  );
}