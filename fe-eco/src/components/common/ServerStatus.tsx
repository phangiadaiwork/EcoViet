import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useServerKeepAlive } from '../../hooks/useServerKeepAlive';

interface ServerStatusProps {
  /**
   * Có hiển thị component hay không
   */
  visible?: boolean;
  /**
   * Vị trí hiển thị - mặc định bottom-right
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Component hiển thị trạng thái kết nối server
 * Có thể sử dụng để debug hoặc hiển thị cho admin
 */
const ServerStatus: React.FC<ServerStatusProps> = ({ 
  visible = false, 
  position = 'bottom-right' 
}) => {
  const { lastPing, pingNow } = useServerKeepAlive({
    enabled: true,
    interval: 4 * 60 * 1000 // 4 phút
  });

  if (!visible) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      margin: '16px'
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0 };
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0 };
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0 };
      default:
        return { ...baseStyles, bottom: 0, right: 0 };
    }
  };

  const getStatus = () => {
    if (!lastPing) return { label: 'Connecting...', color: 'warning' as const };
    
    const now = new Date();
    const diff = now.getTime() - lastPing.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 5) {
      return { label: `Online (${minutes}m ago)`, color: 'success' as const };
    } else {
      return { label: `Last ping ${minutes}m ago`, color: 'warning' as const };
    }
  };

  const status = getStatus();

  return (
    <Box sx={getPositionStyles()}>
      <Tooltip title={`Last ping: ${lastPing?.toLocaleTimeString() || 'Never'}`}>
        <Chip
          label={status.label}
          color={status.color}
          size="small"
          onClick={pingNow}
          sx={{ 
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default ServerStatus;
