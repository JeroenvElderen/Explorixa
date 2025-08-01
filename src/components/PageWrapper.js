// components/PageWrapper.js
import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.32 }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}
