// src/components/pinpage/PinContentSection/index.jsx
import MDBox from "../../MDBox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import PinInfoEditor from "../PinInfoEditor";

export default function PinContentSection({
  pin,
  infoDialogOpen,
  setInfoDialogOpen,
  updatePinInfo,
  isMobile,
}) {
  return (
    <MDBox
      sx={{
        backdropFilter: "blur(20px)",
        background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 6px 15px rgba(241,143,1,0.3)",
        borderRadius: "12px",
        p: 3,
        mb: 3,
        position: "relative",
        width: isMobile ? "98vw" : "100%",
        left: isMobile ? "50%" : "0",
        transform: isMobile ? "translateX(-50%)" : "none",
        "& p": { color: "white !important", mb: 1, fontSize: "18px" },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {pin.Information || ""}
      </ReactMarkdown>
      <PinInfoEditor
        initialInfo={pin.Information}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        onSave={updatePinInfo}
      />
    </MDBox>
  );
}
