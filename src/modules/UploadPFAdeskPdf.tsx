import React, { useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

// Upload PDF to Azure Blob with comment metadata
async function uploadPDFOnAzure(file: File, comment: string): Promise<string | null> {
  try {
    const baseUrl = "https://nwrstorage.blob.core.windows.net/nwr";
    const sasToken =
      "?sp=racwdl&st=2025-09-18T09:26:40Z&se=2025-10-31T17:41:40Z&spr=https&sv=2024-11-04&sr=c&sig=oymY7w5RPd2IkQgz7Dsj2fb9bH%2FJN94h0CrLxwUO8Rw%3D";

    const blobName = `${Date.now()}-${file.name}`;
    const blobUrl = `${baseUrl}/${blobName}${sasToken}`;

    // Step 1: Upload file
    const uploadResponse = await fetch(blobUrl, {
      method: "PUT",
      body: file,
      headers: {
        "x-ms-blob-type": "BlockBlob",
      },
    });

    if (uploadResponse.status !== 201) {
      console.error("Azure upload failed:", uploadResponse.status, await uploadResponse.text());
      return null;
    }

    // Step 2: Add metadata (comment)
    const metadataUrl = `${baseUrl}/${blobName}?comp=metadata&${sasToken.replace(/^\?/, "")}`;
    const metadataResponse = await fetch(metadataUrl, {
      method: "PUT",
      headers: {
        "x-ms-meta-comment": encodeURIComponent(comment),
        "x-ms-version": "2020-10-02",
        "x-ms-date": new Date().toUTCString(),
      },
    });

    if (metadataResponse.status !== 200) {
      console.error("Failed to set metadata:", metadataResponse.status, await metadataResponse.text());
      return null;
    }

    return `${baseUrl}/${blobName}`; // return clean URL
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}

type PFADeskPDFUploadButtonProps = {
  onUploaded?: () => void;
};

const PFADeskPDFUploadButton: React.FC<PFADeskPDFUploadButtonProps> = ({ onUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setSnackbar({
        open: true,
        message: "Only PDF files are allowed.",
        severity: "error",
      });
      return;
    }

    setSelectedFile(file);
    setOpenDialog(true); // open comment dialog
    event.target.value = ""; // reset input
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const uploadedUrl = await uploadPDFOnAzure(selectedFile, comment);
      console.log(uploadedUrl);

      if (uploadedUrl) {
        setSnackbar({
          open: true,
          message: "PDF uploaded successfully!",
          severity: "success",
        });
        if (onUploaded) {
          onUploaded();
        }
      } else {
        setSnackbar({
          open: true,
          message: "Failed to upload PDF.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to upload PDF.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setComment("");
      setSelectedFile(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button
        variant="contained"
        startIcon={
          loading ? (
            <CircularProgress size={20} style={{ color: "#fff" }} />
          ) : (
            <UploadIcon />
          )
        }
        onClick={handleButtonClick}
        disabled={loading}
        sx={{
          backgroundColor: "#222633",
          color: "white",
          "&:hover": { backgroundColor: "#222633" },
          border: "1.5px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          p: "10px",
          fontSize: "12px",
          fontFamily: "MyCustomFont,SourceSerif4_18pt",
          textTransform: "none",
          marginX: 1,
        }}
      >
        {loading ? "Uploading..." : "PDF"}
      </Button>

      {/* Comment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PFADeskPDFUploadButton;
