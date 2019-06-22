import React from 'react';

const TypeAvatar = ({ code, color }: { code: string; color: string }) => {
  return (
    <div
      style={{
        height: '100%',
        // borderRight: `1px solid ${color}`,
        borderTopRightRadius: '16px',
        borderBottomRightRadius: '16px',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
        display: 'flex',
        // backgroundColor: grey[400],
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: color,
          fontWeight: 'bold',
          paddingLeft: '0.7em',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {code}
      </span>
    </div>
  );
};

export { TypeAvatar };
