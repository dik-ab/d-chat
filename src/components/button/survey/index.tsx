import React from 'react';
import Image from 'next/image';

interface SurveyButtonProps {
  /** ボタンタイプ（はい/いいえ） */
  type: 'yes' | 'no';
  /** クリックハンドラー */
  onClick?: () => void;
}

/**
 * アンケートボタンコンポーネント
 * 
 * はい/いいえの選択肢を表示するボタンです。
 * 顔アイコンとテキストを横並びで表示します。
 */
export const SurveyButton: React.FC<SurveyButtonProps> = ({
  type,
  onClick,
}) => {
  const iconSrc = type === 'yes' ? '/yes.svg' : '/no.svg';

  return (
      <Image
        onClick={onClick}
        src={iconSrc}
        alt={`${type} face`}
        width={224}
        height={51}
      />
  );
};

export default SurveyButton;
