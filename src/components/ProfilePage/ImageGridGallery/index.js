import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { Box, Typography } from "@mui/material";

export default function ImageGridGallery({ imageUrls, height = 120 }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const maxImages = 5;
  const extraCount = imageUrls.length - maxImages;
  const visibleImages = imageUrls.slice(0, maxImages);

  const handleClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // 1 image
  if (visibleImages.length === 1) {
    return (
      <>
        <Box
          onClick={() => handleClick(0)}
          sx={{
            width: "100%",
            height,
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
              borderRadius: "4px",
            }}
          />
        </Box>
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={imageUrls.map((src) => ({ src }))}
          index={lightboxIndex}
          plugins={[Zoom]}
        />
      </>
    );
  }

  // 2 images
  if (visibleImages.length === 2) {
    return (
      <>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            width: "100%",
            height,
            gap: 0.5,
          }}
        >
          {visibleImages.map((url, i) => (
            <Box
              key={i}
              onClick={() => handleClick(i)}
              sx={{
                width: "100%",
                height: "100%",
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: "4px",
              }}
            >
              <Box
                component="img"
                src={url}
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
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={imageUrls.map((src) => ({ src }))}
          index={lightboxIndex}
          plugins={[Zoom]}
        />
      </>
    );
  }

  // 3 images: 1 big top, 2 bottom
  if (visibleImages.length === 3) {
    return (
      <>
        <Box
          sx={{
            width: "100%",
            height,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {/* Top image: 60% */}
          <Box
            onClick={() => handleClick(0)}
            sx={{
              width: "100%",
              height: "60%",
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
                borderRadius: "4px",
              }}
            />
          </Box>
          {/* Bottom row: 2 images, 40% height */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
              height: "40%",
            }}
          >
            {[1, 2].map((i) => (
              <Box
                key={i}
                onClick={() => handleClick(i)}
                sx={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  overflow: "hidden",
                  borderRadius: "4px",
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
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={imageUrls.map((src) => ({ src }))}
          index={lightboxIndex}
          plugins={[Zoom]}
        />
      </>
    );
  }

  // 4 images: 1 big top, 3 bottom
  if (visibleImages.length === 4) {
    return (
      <>
        <Box
          sx={{
            width: "100%",
            height,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {/* Top image: 55% */}
          <Box
            onClick={() => handleClick(0)}
            sx={{
              width: "100%",
              height: "55%",
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
                borderRadius: "4px",
              }}
            />
          </Box>
          {/* Bottom row: 3 images, 45% height */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0.5,
              height: "45%",
            }}
          >
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                onClick={() => handleClick(i)}
                sx={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  overflow: "hidden",
                  borderRadius: "4px",
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
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={imageUrls.map((src) => ({ src }))}
          index={lightboxIndex}
          plugins={[Zoom]}
        />
      </>
    );
  }

  // 5+ images: 2 top, 3 bottom (both rows share height: 55/45)
  return (
    <>
      <Box
        sx={{
          width: "100%",
          height,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {/* Top row: 2 images, 55% height */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 0.5,
            height: "55%",
          }}
        >
          {visibleImages.slice(0, 2).map((url, i) => (
            <Box
              key={i}
              onClick={() => handleClick(i)}
              sx={{
                width: "100%",
                height: "100%",
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: "4px",
              }}
            >
              <Box
                component="img"
                src={url}
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
        {/* Bottom row: 3 images, 45% height */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.5,
            height: "45%",
          }}
        >
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
                  height: "100%",
                  cursor: "pointer",
                  overflow: "hidden",
                  borderRadius: "4px",
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
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={imageUrls.map((src) => ({ src }))}
        index={lightboxIndex}
        plugins={[Zoom]}
      />
    </>
  );
}
