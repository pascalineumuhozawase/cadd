import React, { useRef, useState } from "react";
import { diagnoseRequest } from "../services/api";
import ResultCard from "../components/ResultCard";

export default function Diagnose() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  function chooseFile(nextFile) {
    setError(""); setResult(null);
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) { setError("Please choose an image file such as JPG, PNG, or WEBP."); return; }
    if (nextFile.size > 10 * 1024 * 1024) { setError("The image is larger than 10 MB. Please choose a smaller image."); return; }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  async function submit(event) {
    event.preventDefault();
    if (!file) { setError("Choose a clear photo of a cassava leaf first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await diagnoseRequest(file, notes);
      setResult(response.prediction || response.result || response.data || response);
    } catch (e) {
      setError(e.response?.data?.message || "Could not reach the diagnosis service. Check that the backend is running and the API URL is correct.");
    } finally { setLoading(false); }
  }

  return <div className="page">
    <div className="page-title-row"><div><div className="eyebrow">AI-POWERED SCREENING</div><h1>New diagnosis</h1><p>Upload a clear cassava leaf photo to check for possible disease symptoms.</p></div><div className="step-pill"><span>1</span> Upload <span>→</span><span>2</span> Review result</div></div>
    <div className="diagnosis-layout">
      <form className="panel upload-panel" onSubmit={submit}>
        <div className="panel-title"><div><h2>Leaf image</h2><p>For best results, use a well-lit photo with the leaf in focus.</p></div><span className="required-tag">Required</span></div>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => chooseFile(e.target.files?.[0])} />
        {preview ? <div className="image-preview"><img src={preview} alt="Selected cassava leaf preview" /><button type="button" className="remove-image" onClick={() => {setFile(null);setPreview("");setResult(null);}}>Remove image ×</button><div className="image-file-name">{file?.name}</div></div> :
          <button type="button" className="dropzone" onClick={() => inputRef.current?.click()}>
            <span className="upload-symbol">↑</span><b>Click to upload or take a photo</b><span>JPG, PNG or WEBP · up to 10 MB</span><span className="browse-button">Choose image</span>
          </button>}
        <label className="field-label" htmlFor="notes">Additional observations <span>Optional</span></label>
        <textarea id="notes" className="text-area" rows="4" value={notes} onChange={e => setNotes(e.target.value)} placeholder="For example: yellow patches started appearing last week..." />
        <div className="photo-tips"><div className="tips-icon">✦</div><div><b>Photo tips</b><ul><li>Capture the whole leaf, including its edges.</li><li>Avoid shadows and blurry images.</li><li>Photograph one affected leaf at a time.</li></ul></div></div>
        {error && <div className="error-message">{error}</div>}
        <button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? <><span className="spinner"></span> Analyzing image...</> : <>Analyze leaf <span>→</span></>}</button>
      </form>
      <div className="result-column">
        {result ? <ResultCard result={result} /> : <div className="panel waiting-panel"><div className="waiting-illustration"><div className="scan-frame"><span></span><span></span><span></span><span></span><div className="scan-leaf">❧</div></div></div><h2>Your diagnosis will appear here</h2><p>Once your image is analyzed, you’ll see the predicted disease, confidence score, and recommended next steps.</p><div className="waiting-list"><div><span>01</span> Upload a clear leaf photo</div><div><span>02</span> Let the AI examine the image</div><div><span>03</span> Review the result and advice</div></div></div>}
        <div className="privacy-note"><span>♧</span><p><b>Use responsibly</b><br />Do not apply pesticides based on an AI prediction alone. Confirm uncertain results with a trained agronomist.</p></div>
      </div>
    </div>
  </div>;
}
