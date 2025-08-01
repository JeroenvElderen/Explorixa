import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.32,
        exit: { duration: 0.32, delay: 0.18 }, // delay fade out
      }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}
