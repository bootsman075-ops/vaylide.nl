import React from 'react';
import {COLORS, FONTS, TEXTS} from '../config';

export const CARD = {width: 640, height: 440};

// Voorkant van de papieren uitnodiging die uit de envelop komt.
export const InvitationCard: React.FC<{opacity?: number; sheen?: number}> = ({opacity = 1, sheen = -1}) => {
  const {kicker, names, date} = TEXTS.invite;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: CARD.width,
        height: CARD.height,
        marginLeft: -CARD.width / 2,
        marginTop: -CARD.height / 2,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.ink,
        fontFamily: FONTS.serif,
      }}
    >
      <div style={{position: 'absolute', inset: 22, border: `1px solid ${COLORS.gold}`, opacity: 0.7}} />
      <div style={{position: 'absolute', inset: 30, border: `0.75px solid ${COLORS.gold}`, opacity: 0.45}} />
      <div style={{fontSize: 22, letterSpacing: 8, textTransform: 'uppercase', fontWeight: 500, color: '#7A6040'}}>
        {kicker}
      </div>
      <div style={{fontFamily: FONTS.script, fontSize: 92, lineHeight: 1.15, marginTop: 14, color: COLORS.ink}}>
        {names[0]} <span style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 56, color: '#8A6A3E'}}>&amp;</span> {names[1]}
      </div>
      <div style={{width: 90, height: 1, background: COLORS.gold, margin: '18px 0 16px', opacity: 0.8}} />
      <div style={{fontSize: 26, letterSpacing: 2, fontWeight: 500}}>{date}</div>
      {sheen > -1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, transparent ${sheen * 100 - 20}%, rgba(255,250,238,0.55) ${sheen * 100}%, transparent ${sheen * 100 + 20}%)`,
            mixBlendMode: 'soft-light',
          }}
        />
      )}
    </div>
  );
};
