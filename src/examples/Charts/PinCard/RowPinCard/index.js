// src/components/RowPinCard/RowPinCard.jsx  (or wherever the original lives)
import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ReactMarkdown from 'react-markdown';
import PinInteractionPanel from 'components/PinInteractionPanel';

const GlassCard = styled(Card)(({ compact }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  height: compact ? '100px' : '135px',
  alignItems: 'stretch',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
  border: '1px solid rgba(243, 143, 1, 0.6)',
  boxShadow:
    'inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)',
  borderRadius: '12px',
  overflow: 'hidden',
  padding: compact ? '4px' : undefined,
}));

const Content = styled(Box)(({ theme, compact }) => ({
  flex: 1,
  padding: compact
    ? `${theme.spacing(0.5)} ${theme.spacing(1)}`
    : `${theme.spacing(1.2)} ${theme.spacing(2)}`,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  position: 'relative',
}));

const ImageWrapper = styled(Box)(({ height = 120, compact }) => ({
  position: 'relative',
  width: compact ? 80 : 120,
  height: compact ? 80 : height,
  flexShrink: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

export default function RowPinCard({
  title,
  description,
  imageurl,
  imagealt,
  imageHeight = 160,
  isExpanded = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  pin,
  onUpdated,
  compact = false,
  style = {},
}) {
  const handleCardClick = e => {
    onClick?.(e);
  };

  return (
    <GlassCard
      compact={compact ? 1 : 0}
      onClick={handleCardClick}
      sx={{
        cursor: 'pointer',
        width: compact ? 260 : undefined,
        ...style,
      }}
    >
      <Content compact={compact ? 1 : 0}>
        <Typography
          variant="subtitle1"
          sx={{
            mt: 0,
            mb: compact ? 0.2 : 0.4,
            fontWeight: 700,
            fontSize: compact ? '0.9rem' : '1rem',
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>

        <Divider sx={{ my: compact ? 0.3 : 0.4 }} />

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ReactMarkdown
            children={description || ''}
            components={{
              p: ({ node, ...props }) => (
                <Typography
                  component="p"
                  variant="body2"
                  sx={{
                    fontSize: compact ? '10px' : '12px',
                    color: 'white',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: compact ? 1 : 2,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                    mt: compact ? 0.1 : 0.2,
                  }}
                  {...props}
                />
              ),
            }}
          />
        </Box>

        {pin && (
          <Box
            mt={compact ? 0.5 : 1}
            onClick={e => {
              e.stopPropagation(); // prevent bubbling to the card click
            }}
            onClickCapture={e => e.stopPropagation()}
          >
            <PinInteractionPanel pin={pin} onUpdated={onUpdated} compact={compact} />
          </Box>
        )}
      </Content>

      <ImageWrapper
        compact={compact ? 1 : 0}
        height={`${imageHeight}px`}
        sx={{
          backgroundImage: imageurl ? `url(${imageurl})` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: imageurl ? 'transparent' : '#222',
        }}
        aria-label={imagealt || title}
      >
        {!imageurl && (
          <Typography
            sx={{
              color: 'white',
              fontSize: compact ? '11px' : '13px',
              textAlign: 'center',
              opacity: 0.7,
              px: 1,
            }}
          >
            No image found
          </Typography>
        )}
      </ImageWrapper>
    </GlassCard>
  );
}

RowPinCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  imageHeight: PropTypes.number,
  isExpanded: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  pin: PropTypes.object,
  onUpdated: PropTypes.func,
  compact: PropTypes.bool,
  style: PropTypes.object,
};

RowPinCard.defaultProps = {
  description: '',
  imageurl: '',
  imagealt: '',
  imageHeight: 160,
  isExpanded: false,
  onClick: () => {},
  onMouseEnter: () => {},
  onMouseLeave: () => {},
  pin: null,
  onUpdated: () => {},
  compact: false,
  style: {},
};
