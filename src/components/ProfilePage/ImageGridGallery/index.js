import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { Box, Typography } from "@mui/material";

export default function ImageGridGallery({ imageUrls }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const maxImages = 5;
  const visibleImages = imageUrls.slice(0, maxImages);
  const extraCount = imageUrls.length - maxImages;

  const handleClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {visibleImages.length === 1 && (
        <Box
          onClick={() => handleClick(0)}
          sx={{ cursor: "pointer", overflow: "hidden", borderRadius: "4px" }}
        >
          <Box
            component="img"
            src={visibleImages[0]}
            alt="img-0"
            sx={{ width: "100%", objectFit: "cover", display: "block" }}
          />
        </Box>
      )}

      {visibleImages.length === 2 && (
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={0.5}>
          {visibleImages.map((url, index) => (
            <Box
              key={index}
              onClick={() => handleClick(index)}
              sx={{ width: "100%", aspectRatio: "1/1", cursor: "pointer", overflow: "hidden" }}
            >
              <Box
                component="img"
                src={url}
                alt={`img-${index}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "4px",
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {visibleImages.length === 3 && (
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Box
            onClick={() => handleClick(0)}
            sx={{
              width: "100%",
              aspectRatio: "2/1",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: "4px",
            }}
          >
            <Box
              component="img"
              src={visibleImages[0]}
              alt="img-0"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>

          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={0.5}>
            {[1, 2].map((i) => (
              <Box
                key={i}
                onClick={() => handleClick(i)}
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={visibleImages[i]}
                  alt={`img-${i}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {visibleImages.length >= 4 && (
        <Box display="flex" flexDirection="column" gap={0.5}>
          {/* Top row: 2 images */}
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={0.5}>
            {[0, 1].map((i) => (
              <Box
                key={i}
                onClick={() => handleClick(i)}
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={visibleImages[i]}
                  alt={`img-${i}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Bottom row: 2–3 images */}
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={0.5}>
            {visibleImages.slice(2, 5).map((url, i) => {
              const index = i + 2;
              const isLast = i === 2 && extraCount > 0;
              return (
                <Box
                  key={index}
                  position="relative"
                  onClick={() => handleClick(index)}
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`img-${index}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: "4px",
                    }}
                  />
                  {isLast && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      width="100%"
                      height="100%"
                      bgcolor="rgba(0, 0, 0, 0.6)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="4px"
                    >
                      <Typography variant="h4" color="white" fontWeight="bold">
                        +{extraCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={imageUrls.map((src) => ({ src }))}
        index={lightboxIndex}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        carousel={{ finite: false }}
        styles={{
          container: { backgroundColor: "rgba(0,0,0,0.95)" },
        }}
        render={{
          button: () => (
            <Box
              position="absolute"
              top={16}
              right={16}
              bgcolor="rgba(0, 0, 0, 0.6)"
              color="white"
              px={1.5}
              py={0.5}
              borderRadius="8px"
              fontSize="14px"
              zIndex={9999}
            >
              {`${lightboxIndex + 1} / ${imageUrls.length}`}
            </Box>
          ),
        }}
        plugins={[Zoom]}
      />
    </>
  );
}
